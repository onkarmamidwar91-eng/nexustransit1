from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class IssueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    issue_type: str
    confidence: float
    latitude: float
    longitude: float
    timestamp: datetime
    bus_id: Optional[str] = None
    route_id: Optional[str] = None
    status: str
    priority: str
    priority_score: int
    priority_reason: Optional[str] = None
    image_path: Optional[str] = None
    source: str
    description: Optional[str] = None
    observation_count: int
    last_observed_at: Optional[datetime] = None
    department: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    resolution_image_path: Optional[str] = None
    created_at: datetime
    verified_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class AssignRequest(BaseModel):
    department: str
    assigned_to: str
    due_date: Optional[datetime] = None
