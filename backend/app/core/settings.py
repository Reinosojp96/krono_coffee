# backend/app/core/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Union, List
from ast import literal_eval

class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env")
    
    PROJECT_NAME: str
    PROJECT_VERSION: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: str

    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ""

settings = Settings()

if isinstance(settings.BACKEND_CORS_ORIGINS, str):
    try:
        settings.BACKEND_CORS_ORIGINS = literal_eval(settings.BACKEND_CORS_ORIGINS)
    except Exception:
        settings.BACKEND_CORS_ORIGINS = [settings.BACKEND_CORS_ORIGINS]

print("🔥 CORS ORIGINS cargados desde .env:", settings.BACKEND_CORS_ORIGINS)
