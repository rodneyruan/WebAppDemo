from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import ImageOut, ImageRequest
from app.security import get_current_user, oauth2_scheme
from app.services.image_generation import generate_image
from app.supabase_client import get_request_supabase_client

router = APIRouter(prefix="/images", tags=["images"])


@router.get("", response_model=list[ImageOut])
def list_images(
    token: str = Depends(oauth2_scheme),
    current_user: dict = Depends(get_current_user),
):
    client = get_request_supabase_client(token)
    response = (
        client.table("generated_images")
        .select("id, prompt, image_url, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/generate", response_model=ImageOut)
def create_image(
    payload: ImageRequest,
    token: str = Depends(oauth2_scheme),
    current_user: dict = Depends(get_current_user),
):
    client = get_request_supabase_client(token)

    if current_user["credits"] <= 0 and not current_user["is_subscribed"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="You have used your 5 free generations. Subscribe to continue.",
        )

    try:
        image_url = generate_image(payload.prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if not current_user["is_subscribed"]:
        updated_credits = current_user["credits"] - 1
        updated_user = client.table("users").update({"credits": updated_credits}).eq("id", current_user["id"]).execute()
        if updated_user.data:
            current_user["credits"] = updated_user.data[0]["credits"]

    image = (
        client.table("generated_images")
        .insert({"prompt": payload.prompt, "image_url": image_url, "user_id": current_user["id"]})
        .execute()
    )
    if not image.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not save generated image")
    return image.data[0]
