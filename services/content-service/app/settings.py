from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CONTENT_", extra="ignore")
    database_url: str = "postgresql+psycopg://content:content@localhost:5432/transformation"
    definitions_dir: str = "definitions"


settings = Settings()
