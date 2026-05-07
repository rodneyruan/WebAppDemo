import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.core.config import get_settings
from app.schemas import CheckoutSessionOut
from app.security import get_current_user, oauth2_scheme
from app.supabase_client import get_request_supabase_client, get_supabase_client, supabase_key_is_publishable

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutSessionOut)
def create_checkout_session(
    token: str = Depends(oauth2_scheme),
    current_user: dict = Depends(get_current_user),
):
    settings = get_settings()
    if not settings.stripe_secret_key or not settings.stripe_price_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe is not configured")

    stripe.api_key = settings.stripe_secret_key
    client = get_request_supabase_client(token)

    customer_id = current_user.get("stripe_customer_id")
    if not customer_id:
        customer = stripe.Customer.create(email=current_user["email"], metadata={"user_id": current_user["id"]})
        customer_id = customer.id
        updated = client.table("users").update({"stripe_customer_id": customer_id}).eq("id", current_user["id"]).execute()
        if updated.data:
            current_user = updated.data[0]

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        success_url=f"{settings.frontend_url}/dashboard?subscribed=1",
        cancel_url=f"{settings.frontend_url}/pricing?canceled=1",
        metadata={"user_id": current_user["id"]},
    )
    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
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

    if supabase_key_is_publishable():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook updates require SUPABASE_KEY to be a secret backend key.",
        )

    client = get_supabase_client()
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        if user_id:
            client.table("users").update({"is_subscribed": True}).eq("id", user_id).execute()

    if event_type in {"customer.subscription.deleted", "customer.subscription.paused"}:
        customer_id = data.get("customer")
        client.table("users").update({"is_subscribed": False}).eq("stripe_customer_id", customer_id).execute()

    return {"received": True}
