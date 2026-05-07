from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session
import stripe

from app.core.config import get_settings
from app.database import get_db
from app.models import User
from app.schemas import CheckoutSessionOut
from app.security import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutSessionOut)
def create_checkout_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = get_settings()
    if not settings.stripe_secret_key or not settings.stripe_price_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe is not configured")

    stripe.api_key = settings.stripe_secret_key

    customer_id = current_user.stripe_customer_id
    if not customer_id:
        customer = stripe.Customer.create(email=current_user.email, metadata={"user_id": current_user.id})
        customer_id = customer.id
        current_user.stripe_customer_id = customer_id
        db.add(current_user)
        db.commit()

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        success_url=f"{settings.frontend_url}/dashboard?subscribed=1",
        cancel_url=f"{settings.frontend_url}/pricing?canceled=1",
        metadata={"user_id": current_user.id},
    )
    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe webhook") from exc

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        if user_id:
            user = db.get(User, user_id)
            if user:
                user.is_subscribed = True
                db.add(user)
                db.commit()

    if event_type in {"customer.subscription.deleted", "customer.subscription.paused"}:
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.is_subscribed = False
            user.credits = max(user.credits, 0)
            db.add(user)
            db.commit()

    return {"received": True}
