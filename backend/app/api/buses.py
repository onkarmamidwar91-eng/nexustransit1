from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bus import Bus
from app.models.issue import Issue
from app.schemas.bus import BusOut, BusCreate

router = APIRouter(prefix="/api/buses", tags=["buses"])


@router.get("", response_model=List[BusOut])
def list_buses(db: Session = Depends(get_db)):
    return db.query(Bus).all()


@router.get("/{bus_id}", response_model=BusOut)
def get_bus(bus_id: str, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.bus_id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus


@router.post("", response_model=BusOut)
def create_bus(payload: BusCreate, db: Session = Depends(get_db)):
    if db.query(Bus).filter(Bus.bus_id == payload.bus_id).first():
        raise HTTPException(status_code=400, detail="Bus with this ID already exists")
    bus = Bus(bus_id=payload.bus_id, route_name=payload.route_name, status=payload.status)
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus


@router.get("/{bus_id}/issue-count")
def bus_issue_count(bus_id: str, db: Session = Depends(get_db)):
    count = db.query(func.count(Issue.id)).filter(Issue.bus_id == bus_id).scalar()
    return {"bus_id": bus_id, "issues_detected": count}
