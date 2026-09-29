from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime

from app.database import Base


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(String, unique=True, index=True, nullable=False)  # e.g. "NXT-001"
    route_name = Column(String, nullable=False)  # e.g. "Pune Station -> Swargate"
    status = Column(String, default="ACTIVE")  # ACTIVE / INACTIVE

    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_seen = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
