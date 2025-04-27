# src/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:PXRVoupiFaCkeKXePPfsnXtWDPSeTGnq@maglev.proxy.rlwy.net:53680/railway"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "supersecret"

settings = Settings()