# src/config/settings.py
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PORT : int = int(os.getenv('PORT', 8000))
    DATABASE_URL: str = os.getenv('DATABASE_URL')
    REDIS_URL: str =  os.getenv('REDIS_URL')
    REDIS_PORT: int = int(os.getenv('REDIS_PORT', 6379))
    SECRET_KEY : str = os.getenv('SECRET_KEY')

settings = Settings()