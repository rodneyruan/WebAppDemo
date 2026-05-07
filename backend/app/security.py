from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from supabase import Client, create_client

from app.core.config import get_settings
from app.database import get_db
from app.models import User

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/me")


def get_supabase_admin_client() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured",
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Supabase session",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        supabase = get_supabase_admin_client()
        auth_response = supabase.auth.get_user(token)
        auth_user = auth_response.user
    except Exception as exc:
        raise credentials_exception from exc

    if auth_user is None or auth_user.id is None or auth_user.email is None:
        raise credentials_exception

    user = db.get(User, auth_user.id)
    if user is None:
        user = User(id=auth_user.id, email=auth_user.email.lower(), credits=5)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    normalized_email = auth_user.email.lower()
    if user.email != normalized_email:
        user.email = normalized_email
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
