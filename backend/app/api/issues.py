from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.issue import Issue
from app.schemas.issue import IssueOut, AssignRequest
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/issues", tags=["issues"])


@router.get("", response_model=List[IssueOut])
def list_issues(
    status: Optional[str] = Query(None),
    issue_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    bus_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Issue)
    if status:
        q = q.filter(Issue.status == status)
    if issue_type:
        q = q.filter(Issue.issue_type == issue_type)
    if priority:
        q = q.filter(Issue.priority == priority)
    if bus_id:
        q = q.filter(Issue.bus_id == bus_id)
    return q.order_by(Issue.created_at.desc()).all()


@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


def _get_or_404(db: Session, issue_id: int) -> Issue:
    issue = db.query(Issue).get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.post("/{issue_id}/verify", response_model=IssueOut)
def verify_issue(issue_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    issue = _get_or_404(db, issue_id)
    issue.status = "VERIFIED"
    issue.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/reject", response_model=IssueOut)
def reject_issue(issue_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    issue = _get_or_404(db, issue_id)
    issue.status = "REJECTED"
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/assign", response_model=IssueOut)
def assign_issue(issue_id: int, payload: AssignRequest, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    issue = _get_or_404(db, issue_id)
    issue.status = "ASSIGNED"
    issue.department = payload.department
    issue.assigned_to = payload.assigned_to
    issue.due_date = payload.due_date
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/progress", response_model=IssueOut)
def mark_in_progress(issue_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    issue = _get_or_404(db, issue_id)
    issue.status = "IN_PROGRESS"
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/resolve", response_model=IssueOut)
def resolve_issue(issue_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    issue = _get_or_404(db, issue_id)
    issue.status = "RESOLVED"
    issue.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(issue)
    return issue
