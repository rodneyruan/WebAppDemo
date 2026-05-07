from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Image Subscription API"
    environment: str = "development"
    database_url: str = "sqlite:///./app.db"
    frontend_url: str = "http://localhost:3000"
    openai_api_key: str = ""
    openai_image_model: str = "gpt-image-1"
    stripe_secret_key: str = ""
    stripe_price_id: str = ""
    stripe_webhook_secret: str = ""
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_service_role_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
