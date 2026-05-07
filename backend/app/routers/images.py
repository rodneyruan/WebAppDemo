from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GeneratedImage, User
from app.schemas import ImageOut, ImageRequest
from app.security import get_current_user
from app.services.image_generation import generate_image

router = APIRouter(prefix="/images", tags=["images"])


@router.get("", response_model=list[ImageOut])
def list_images(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(GeneratedImage)
        .filter(GeneratedImage.user_id == current_user.id)
        .order_by(GeneratedImage.created_at.desc())
        .all()
    )


@router.post("/generate", response_model=ImageOut)
def create_image(
    payload: ImageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.credits <= 0 and not current_user.is_subscribed:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="You have used your 5 free generations. Subscribe to continue.",
        )

    try:
        image_url = generate_image(payload.prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    if not current_user.is_subscribed:
        current_user.credits -= 1

    image = GeneratedImage(prompt=payload.prompt, image_url=image_url, user_id=current_user.id)
    db.add(image)
    db.add(current_user)
    db.commit()
    db.refresh(image)
    return image

