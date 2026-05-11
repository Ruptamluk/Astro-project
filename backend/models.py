from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class RequestOTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str

class VerifyOTPRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str

class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    zodiac_sign: Optional[str] = None
    tokens: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class DOBSubmitRequest(BaseModel):
    dob: str  # Format: YYYY-MM-DD

class PredictionResponse(BaseModel):
    zodiac_sign: str
    prediction: str
    lucky_color: str
    lucky_number: int
    compatibility: str

class UseTokenRequest(BaseModel):
    user_id: str

class CreateOrderRequest(BaseModel):
    user_id: str
    token_pack: int  # 1, 5, or 10

class VerifyPaymentRequest(BaseModel):
    user_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    token_pack: int

class OTPModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    verified: bool = False
    
    class Config:
        populate_by_name = True
