from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    credits: int
    is_subscribed: bool

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ImageRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=1000)


class ImageOut(BaseModel):
    id: int
    prompt: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class CheckoutSessionOut(BaseModel):
    checkout_url: str

