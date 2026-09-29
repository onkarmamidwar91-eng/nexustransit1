from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Text

from app.database import Base

# Allowed values (kept as plain strings rather than DB enums so SQLite
# stays simple for the MVP; validated at the Pydantic schema layer).
ISSUE_TYPES = ["POTHOLE", "GARBAGE", "WATERLOGGING", "OBSTRUCTION", "STREETLIGHT", "OTHER"]
ISSUE_STATUSES = [
    "DETECTED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED",
    "ASSIGNED", "IN_PROGRESS", "RESOLVED",
]
ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)

    issue_type = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)  # detection time

    bus_id = Column(String, nullable=True)
    route_id = Column(String, nullable=True)

    status = Column(String, default="PENDING_VERIFICATION")
    priority = Column(String, default="MEDIUM")
    priority_score = Column(Integer, default=50)
    priority_reason = Column(Text, nullable=True)

    image_path = Column(String, nullable=True)
    source = Column(String, default="DEMO_DETECTION")  # DEMO_DETECTION / UPLOAD
    description = Column(Text, nullable=True)

    # Duplicate-detection bookkeeping
    observation_count = Column(Integer, default=1)
    last_observed_at = Column(DateTime, default=datetime.utcnow)

    # Maintenance workflow
    department = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    resolution_image_path = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
