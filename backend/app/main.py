from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import billing, images, users

settings = get_settings()
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in settings.frontend_url.split(",")
    if origin.strip()
]

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(billing.router, prefix="/api")


@app.get("/health")
def health():
    return {"ok": True}
