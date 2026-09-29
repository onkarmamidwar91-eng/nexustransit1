from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database import get_db
from app.models.issue import Issue
from app.models.bus import Bus

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Issue.id)).scalar() or 0
    critical = db.query(func.count(Issue.id)).filter(Issue.priority == "CRITICAL").scalar() or 0
    pending = db.query(func.count(Issue.id)).filter(
        Issue.status.in_(["DETECTED", "PENDING_VERIFICATION"])
    ).scalar() or 0
    resolved = db.query(func.count(Issue.id)).filter(Issue.status == "RESOLVED").scalar() or 0
    active_buses = db.query(func.count(Bus.id)).filter(Bus.status == "ACTIVE").scalar() or 0

    return {
        "total_issues": total,
        "critical_issues": critical,
        "pending_verification": pending,
        "resolved_issues": resolved,
        "active_buses": active_buses,
    }


@router.get("/analytics")
def dashboard_analytics(db: Session = Depends(get_db)):
    by_type = dict(db.query(Issue.issue_type, func.count(Issue.id)).group_by(Issue.issue_type).all())
    by_priority = dict(db.query(Issue.priority, func.count(Issue.id)).group_by(Issue.priority).all())
    by_route = dict(db.query(Issue.route_id, func.count(Issue.id)).group_by(Issue.route_id).all())
    by_status = dict(db.query(Issue.status, func.count(Issue.id)).group_by(Issue.status).all())

    resolved = db.query(func.count(Issue.id)).filter(Issue.status == "RESOLVED").scalar() or 0
    unresolved = (db.query(func.count(Issue.id)).scalar() or 0) - resolved

    by_day_raw = (
        db.query(func.date(Issue.created_at), func.count(Issue.id))
        .group_by(func.date(Issue.created_at))
        .order_by(func.date(Issue.created_at))
        .all()
    )
    by_day = [{"date": str(d), "count": c} for d, c in by_day_raw]

    return {
        "issues_by_type": by_type,
        "issues_by_priority": by_priority,
        "issues_by_route": by_route,
        "issues_by_status": by_status,
        "issues_per_day": by_day,
        "resolved_vs_unresolved": {"resolved": resolved, "unresolved": max(unresolved, 0)},
        "note": "Sample/demo data for MVP demonstration.",
    }
