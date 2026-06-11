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
    know_more_access: bool = False
    know_more_tokens: int = 0
    know_more_view_expires_at: Optional[datetime] = None
    report_logo_access: bool = False
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
