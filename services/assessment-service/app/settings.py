from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ASSESSMENT_", extra="ignore")
    database_url: str = "postgresql+psycopg://assessment:assessment@localhost:5432/transformation"
    redis_url: str = "redis://localhost:6379/0"
    content_url: str = "http://localhost:8001"
    recommendation_url: str = "http://localhost:8003"
    dependency_timeout_seconds: float = 3.0
    questionnaire_cache_seconds: int = 60


settings = Settings()
