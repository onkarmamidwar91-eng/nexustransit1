"""
Centralized application settings.

All configuration is read from environment variables (see .env.example).
If no .env file is present, sensible MVP defaults are used — in particular
the app falls back to a local SQLite database so the project can run with
zero external services.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "NexusTransit"
    environment: str = "development"
    debug: bool = True

    # Database — SQLite fallback by default (no Postgres required for MVP)
    database_url: str = "sqlite:///./nexustransit.db"

    # Auth
    jwt_secret_key: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # CORS
    frontend_origin: str = "http://localhost:5173"

    # Uploads
    upload_dir: str = "uploads"
    processed_dir: str = "processed"
    max_upload_size_mb: int = 100

    # AI
    demo_mode: bool = True
    detection_confidence_threshold: float = 0.4

    # Redis (prepared for later; not required for MVP synchronous mode)
    redis_url: str = "redis://localhost:6379/0"
    use_redis_queue: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
