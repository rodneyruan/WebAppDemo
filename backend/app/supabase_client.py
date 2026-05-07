from functools import lru_cache

from fastapi import HTTPException, status
from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions

from app.core.config import get_settings


def _client_options(headers: dict[str, str] | None = None) -> ClientOptions:
    return ClientOptions(
        schema="public",
        headers=headers or {},
        auto_refresh_token=False,
        persist_session=False,
    )


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured",
        )
    return create_client(settings.supabase_url, settings.supabase_key, options=_client_options())


def get_request_supabase_client(token: str) -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured",
        )
    return create_client(
        settings.supabase_url,
        settings.supabase_key,
        options=_client_options(headers={"Authorization": f"Bearer {token}"}),
    )


def supabase_key_is_publishable() -> bool:
    settings = get_settings()
    return settings.supabase_key.startswith("sb_publishable_")
