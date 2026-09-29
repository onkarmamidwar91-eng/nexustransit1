import os
import random
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.bus import Bus
from app.ai.detector import detection_service
from app.services.gps_simulator import get_random_point_on_route
from app.services.issue_service import create_or_update_issue
from app.schemas.issue import IssueOut

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png"}
ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".avi"}
MAX_BYTES = settings.max_upload_size_mb * 1024 * 1024


def _save_upload(file: UploadFile, allowed_ext: set) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext}'")

    contents = file.file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_size_mb}MB limit")

    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.upload_dir, filename)
    with open(path, "wb") as f:
        f.write(contents)
    return path


def _process_and_create_issue(db: Session, file_path: str, bus_id: str | None):
    bus = None
    if bus_id:
        bus = db.query(Bus).filter(Bus.bus_id == bus_id).first()
    if bus is None:
        bus = db.query(Bus).first()
    if bus is None:
        raise HTTPException(status_code=400, detail="No buses exist yet — seed the database first")

    detection = detection_service.run(file_path=file_path)
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
        image_path=file_path,
    )
    return issue


@router.post("/image", response_model=IssueOut)
def upload_image(file: UploadFile = File(...), bus_id: str | None = Form(None), db: Session = Depends(get_db)):
    path = _save_upload(file, ALLOWED_IMAGE_EXT)
    return _process_and_create_issue(db, path, bus_id)


@router.post("/video", response_model=IssueOut)
def upload_video(file: UploadFile = File(...), bus_id: str | None = Form(None), db: Session = Depends(get_db)):
    path = _save_upload(file, ALLOWED_VIDEO_EXT)
    # NOTE: real frame-extraction (OpenCV) runs here once ultralytics/opencv
    # are installed and DEMO_MODE=false; in demo mode we still create a
    # realistic issue so the end-to-end workflow can be shown immediately.
    return _process_and_create_issue(db, path, bus_id)
