"""
Seed the database with sample data for the MVP demo.

Run with:
    python -m app.seed
"""
import random
from datetime import datetime, timedelta

from app.database import Base, engine, SessionLocal
from app import models  # noqa: F401
from app.models.bus import Bus
from app.models.user import User
from app.models.issue import Issue
from app.services.gps_simulator import SAMPLE_ROUTES
from app.services.priority_engine import calculate_priority
from app.utils.security import hash_password

ISSUE_TYPES = ["POTHOLE", "GARBAGE", "WATERLOGGING", "OBSTRUCTION", "STREETLIGHT", "OTHER"]
STATUSES = ["DETECTED", "PENDING_VERIFICATION", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Bus).count() > 0:
            print("Database already seeded — skipping. Delete nexustransit.db to re-seed.")
            return

        # --- Users ---
        demo_users = [
            ("admin", "admin123", "ADMIN", "Demo Admin"),
            ("operator", "operator123", "OPERATOR", "Demo Operator"),
            ("field", "field123", "FIELD_WORKER", "Demo Field Worker"),
        ]
        for username, password, role, full_name in demo_users:
            db.add(User(username=username, hashed_password=hash_password(password), role=role, full_name=full_name))

        # --- Buses (one per sample route) ---
        route_names = list(SAMPLE_ROUTES.keys())
        buses = []
        for i, route_name in enumerate(route_names, start=1):
            points = SAMPLE_ROUTES[route_name]
            lat, lon = points[0]
            bus = Bus(
                bus_id=f"NXT-{i:03d}",
                route_name=route_name,
                status="ACTIVE",
                last_latitude=lat,
                last_longitude=lon,
                last_seen=datetime.utcnow() - timedelta(minutes=random.randint(0, 10)),
            )
            db.add(bus)
            buses.append(bus)
        db.flush()  # so buses have bus_id available below

        # --- 20 sample issues, spread across types/priorities/statuses ---
        for i in range(20):
            bus = random.choice(buses)
            points = SAMPLE_ROUTES[bus.route_name]
            lat, lon = random.choice(points)
            lat += random.uniform(-0.001, 0.001)
            lon += random.uniform(-0.001, 0.001)

            issue_type = random.choice(ISSUE_TYPES)
            confidence = round(random.uniform(0.55, 0.97), 2)
            observation_count = random.choice([1, 1, 1, 2, 3])
            priority, score, reason = calculate_priority(issue_type, confidence, observation_count)
            status = random.choice(STATUSES)
            created_at = datetime.utcnow() - timedelta(days=random.randint(0, 13), hours=random.randint(0, 23))

            issue = Issue(
                issue_type=issue_type,
                confidence=confidence,
                latitude=round(lat, 6),
                longitude=round(lon, 6),
                timestamp=created_at,
                bus_id=bus.bus_id,
                route_id=bus.route_name,
                status=status,
                priority=priority,
                priority_score=score,
                priority_reason=reason,
                source="DEMO_DETECTION",
                description=f"Seed data — {issue_type.title()} reported by {bus.bus_id}.",
                observation_count=observation_count,
                last_observed_at=created_at,
                created_at=created_at,
                verified_at=created_at + timedelta(hours=2) if status not in ("DETECTED", "PENDING_VERIFICATION") else None,
                resolved_at=created_at + timedelta(days=1) if status == "RESOLVED" else None,
                department="Road Maintenance" if status in ("ASSIGNED", "IN_PROGRESS", "RESOLVED") else None,
                assigned_to="Road Team A" if status in ("ASSIGNED", "IN_PROGRESS", "RESOLVED") else None,
            )
            db.add(issue)

        db.commit()
        print("Seed complete: 3 users, 5 buses, 5 routes, 20 issues.")
        print("Demo logins -> admin/admin123, operator/operator123, field/field123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
