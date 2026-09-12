from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application configuration settings for LearnIQ"""
    
    # Application
    APP_NAME: str = "LearnIQ - Predictive AI Learning Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./adaptive_learning.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "learniq-ibm-hackathon-secure-secret-key-2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # AI/ML Configuration
    AI_MODEL_PATH: str = os.getenv("AI_MODEL_PATH", "./models")
    ENABLE_AI_RECOMMENDATIONS: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
