from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.issue import Issue
from app.utils.geo import haversine_meters

DUPLICATE_DISTANCE_METERS = 30
DUPLICATE_TIME_WINDOW_MINUTES = 120


def find_duplicate(db: Session, issue_type: str, latitude: float, longitude: float) -> Issue | None:
    """
    Two detections are duplicates if they're the same issue_type, within
    30 meters of each other, and within the configured time window.
    Only checks issues that aren't already resolved/rejected.
    """
    cutoff = datetime.utcnow() - timedelta(minutes=DUPLICATE_TIME_WINDOW_MINUTES)
    candidates = (
        db.query(Issue)
        .filter(Issue.issue_type == issue_type)
        .filter(Issue.status.notin_(["RESOLVED", "REJECTED"]))
        .filter(Issue.last_observed_at >= cutoff)
        .all()
    )
    for candidate in candidates:
        distance = haversine_meters(latitude, longitude, candidate.latitude, candidate.longitude)
        if distance <= DUPLICATE_DISTANCE_METERS:
            return candidate
    return None
