from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.supabase_client import get_request_supabase_client, get_supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/me")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Supabase session",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.get_user(token)
        auth_user = auth_response.user
    except Exception as exc:
        raise credentials_exception from exc

    if auth_user is None or auth_user.id is None or auth_user.email is None:
        raise credentials_exception

    normalized_email = auth_user.email.lower()
    scoped_client = get_request_supabase_client(token)
    response = scoped_client.table("users").select("*").eq("id", auth_user.id).limit(1).execute()
    existing_user = response.data[0] if response.data else None

    if existing_user is None:
        created = (
            scoped_client.table("users")
            .insert({"id": auth_user.id, "email": normalized_email, "credits": 5, "is_subscribed": False})
            .execute()
        )
        if not created.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user profile")
        return created.data[0]

    if existing_user.get("email") != normalized_email:
        updated = scoped_client.table("users").update({"email": normalized_email}).eq("id", auth_user.id).execute()
        if updated.data:
            return updated.data[0]

    return existing_user
