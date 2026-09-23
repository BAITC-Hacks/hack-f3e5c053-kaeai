from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Sana Challenge Hub API"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/challenge_hub"
    ai_service_url: str = "http://127.0.0.1:8001"
    ai_timeout_seconds: float = 45
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 1440

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
