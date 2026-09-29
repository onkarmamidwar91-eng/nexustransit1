from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bus_id: str
    route_name: str
    status: str
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    last_seen: Optional[datetime] = None


class BusCreate(BaseModel):
    bus_id: str
    route_name: str
    status: str = "ACTIVE"
