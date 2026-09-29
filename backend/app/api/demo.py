"""
POST /api/demo/run implements the exact scripted workflow from the spec's
section 19/28: pick a sample bus, run a (demo) detection, attach simulated
GPS, score priority, save the issue, and return it ready to show on the
map / verification queue. No real file upload is needed to trigger this —
that's the point of a one-click "Run Demo" button.
"""
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bus import Bus
from app.ai.detector import detection_service
from app.services.gps_simulator import get_random_point_on_route
from app.services.issue_service import create_or_update_issue
from app.schemas.issue import IssueOut

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/run", response_model=IssueOut)
def run_demo(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    if not buses:
        raise HTTPException(status_code=400, detail="No buses exist yet — run the seed script first")

    bus = random.choice(buses)
    detection = detection_service.run(file_path=None)  # demo mode: no real file needed
    lat, lon = get_random_point_on_route(bus.route_name)

    issue, created = create_or_update_issue(
        db,
        issue_type=detection["issue_type"],
        confidence=detection["confidence"],
        latitude=lat,
        longitude=lon,
        bus_id=bus.bus_id,
        route_id=bus.route_name,
        source=detection["source"],
        image_path=None,
    )
    return issue
