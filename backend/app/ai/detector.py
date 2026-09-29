"""
DetectionService
----------------
Real path: run a YOLO model (via Ultralytics) on an uploaded image/video.
Demo path: if no trained pothole/garbage weights are available (or the
ultralytics/opencv packages simply aren't installed), fall back to
DEMO MODE and return realistic *labeled* sample detections instead.

We do NOT pretend a generic pretrained COCO model can reliably detect
potholes or garbage — those aren't COCO classes. Real detection only
turns on once custom-trained weights are placed in backend/models/.
"""
import os
import random

from app.config import settings

CUSTOM_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "pothole_garbage.pt")

DEMO_DETECTIONS = [
    {"issue_type": "POTHOLE", "confidence_range": (0.80, 0.96)},
    {"issue_type": "GARBAGE", "confidence_range": (0.75, 0.93)},
]


def _real_model_available() -> bool:
    if settings.demo_mode:
        return False
    if not os.path.exists(CUSTOM_WEIGHTS_PATH):
        return False
    try:
        import ultralytics  # noqa: F401
        return True
    except ImportError:
        return False


class DetectionService:
    def __init__(self):
        self.using_real_model = _real_model_available()
        self._model = None
        if self.using_real_model:
            from ultralytics import YOLO
            self._model = YOLO(CUSTOM_WEIGHTS_PATH)

    def run(self, file_path: str | None = None, focus: str | None = None) -> dict:
        """
        Returns a single best detection as:
            {"issue_type", "confidence", "source", "bbox"}
        `source` is either "REAL_MODEL" or "DEMO_DETECTION" — always check it
        before treating a confidence score as a real accuracy statistic.
        """
        if self.using_real_model and self._model is not None and file_path:
            results = self._model.predict(file_path, conf=settings.detection_confidence_threshold, verbose=False)
            boxes = results[0].boxes if results else None
            if boxes is not None and len(boxes) > 0:
                best = max(boxes, key=lambda b: float(b.conf[0]))
                cls_name = self._model.names[int(best.cls[0])].upper()
                return {
                    "issue_type": cls_name,
                    "confidence": round(float(best.conf[0]), 2),
                    "source": "REAL_MODEL",
                    "bbox": [round(float(x), 1) for x in best.xyxy[0].tolist()],
                }
            # real model ran but found nothing confident enough
            return {"issue_type": "OTHER", "confidence": 0.0, "source": "REAL_MODEL", "bbox": None}

        # --- DEMO MODE ---
        choice = next((d for d in DEMO_DETECTIONS if d["issue_type"] == focus), None) or random.choice(DEMO_DETECTIONS)
        low, high = choice["confidence_range"]
        return {
            "issue_type": choice["issue_type"],
            "confidence": round(random.uniform(low, high), 2),
            "source": "DEMO_DETECTION",
            "bbox": None,
        }


detection_service = DetectionService()
