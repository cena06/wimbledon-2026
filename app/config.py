from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "Wimbledon 2026 Predictor API"
    app_version: str = "1.0.0"
    debug: bool = False
    data_path: str = "data/Wimbledon_2026_Raw_Input_With_H2H.xlsx"
    allowed_origins: str = "*"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()