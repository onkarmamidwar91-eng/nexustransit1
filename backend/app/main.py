"""
NexusTransit backend entrypoint.

Run locally with:
    uvicorn app.main:app --reload
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401 - ensures models are registered before create_all
from app.api import auth, issues, buses, dashboard, upload, demo

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Mobile Urban Intelligence Platform — backend API",
    version="0.1.0",
)

# --- CORS: allow the frontend (dev server or deployed Vercel URL) to call this API ---
extra_origins = [o.strip() for o in settings.frontend_origin.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(extra_origins + ["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:4173"])),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Ensure upload/processed directories exist on startup ---
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.processed_dir, exist_ok=True)

# --- Create DB tables if they don't exist yet (SQLite/Postgres both fine) ---
Base.metadata.create_all(bind=engine)

# --- Serve uploaded images so the frontend can display them directly ---
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# --- Routers ---
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(buses.router)
app.include_router(dashboard.router)
app.include_router(upload.router)
app.include_router(demo.router)


@app.get("/api/health")
def health_check():
    """Simple liveness/readiness check — also reports which mode the API is in."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "demo_mode": settings.demo_mode,
        "database": "sqlite" if settings.database_url.startswith("sqlite") else "postgresql",
    }


@app.get("/")
def root():
    return {"message": f"{settings.app_name} API is running. See /docs for API documentation."}


# NOTE: Routers for /api/issues, /api/buses, /api/upload, /api/auth, /api/dashboard
# are added in later phases (Phase 4 onward) via app.api.* modules and
# app.include_router(...) here.
