from datetime import datetime

from sqlalchemy.orm import Session

from app.models.issue import Issue
from app.services.priority_engine import calculate_priority
from app.services.duplicate_service import find_duplicate


def create_or_update_issue(
    db: Session,
    issue_type: str,
    confidence: float,
    latitude: float,
    longitude: float,
    bus_id: str | None,
    route_id: str | None,
    source: str,
    image_path: str | None = None,
) -> tuple[Issue, bool]:
    """
    Creates a new Issue, or — if a matching detection already exists
    nearby and recently — bumps its observation_count instead.
    Returns (issue, was_created).
    """
    duplicate = find_duplicate(db, issue_type, latitude, longitude)

    if duplicate:
        duplicate.observation_count += 1
        duplicate.last_observed_at = datetime.utcnow()
        priority, score, reason = calculate_priority(issue_type, confidence, duplicate.observation_count)
        duplicate.priority = priority
        duplicate.priority_score = score
        duplicate.priority_reason = reason
        db.commit()
        db.refresh(duplicate)
        return duplicate, False

    priority, score, reason = calculate_priority(issue_type, confidence, observation_count=1)
    issue = Issue(
        issue_type=issue_type,
        confidence=confidence,
        latitude=latitude,
        longitude=longitude,
        timestamp=datetime.utcnow(),
        bus_id=bus_id,
        route_id=route_id,
        status="PENDING_VERIFICATION",
        priority=priority,
        priority_score=score,
        priority_reason=reason,
        image_path=image_path,
        source=source,
        observation_count=1,
        last_observed_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue, True
