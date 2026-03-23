from fastapi import APIRouter, Depends, HTTPException, Request
from models import RequestOTPRequest, VerifyOTPRequest, User
from utils import generate_otp, send_otp_via_email, send_otp_via_sms
from datetime import datetime, timedelta
import os

router = APIRouter()

async def get_db(request: Request):
    return request.app.db

@router.post("/register")
async def register(request_data: RequestOTPRequest, db=Depends(get_db)):
    """Register a new user with email or phone"""
    
    if not request_data.email and not request_data.phone:
        raise HTTPException(status_code=400, detail="Email or phone number is required")
    
    users_collection = db["users"]
    
    # Check if user already exists
    query = {}
    if request_data.email:
        query["email"] = request_data.email
    if request_data.phone:
        query["phone"] = request_data.phone
    
    existing_user = await users_collection.find_one(query)
    if existing_user:
        raise HTTPException(status_code=409, detail="User already registered. Please login instead.")
    
    # Generate and send OTP
    otp = await generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp_data = {
        "email": request_data.email,
        "phone": request_data.phone,
        "otp": otp,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "verified": False,
        "type": "registration"
    }
    
    # Save OTP to database
    otps_collection = db["otps"]
    result = await otps_collection.insert_one(otp_data)
    
    # Send OTP
    if request_data.email:
        send_otp_via_email(request_data.email, otp)
        contact = request_data.email
    else:
        await send_otp_via_sms(request_data.phone, otp)
        contact = request_data.phone
    
    return {
        "success": True,
        "message": f"OTP sent to {contact}. Please verify to complete registration.",
        "otp_id": str(result.inserted_id)
    }

@router.post("/login")
async def login(request_data: RequestOTPRequest, db=Depends(get_db)):
    """Request OTP for login"""
    
    if not request_data.email and not request_data.phone:
        raise HTTPException(status_code=400, detail="Email or phone number is required")
    
    users_collection = db["users"]
    
    # Check if user exists
    query = {}
    if request_data.email:
        query["email"] = request_data.email
    else:
        query["phone"] = request_data.phone
    
    user = await users_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    # Generate and send OTP
    otp = await generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp_data = {
        "email": request_data.email,
        "phone": request_data.phone,
        "otp": otp,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "verified": False,
        "type": "login"
    }
    
    # Save OTP to database
    otps_collection = db["otps"]
    result = await otps_collection.insert_one(otp_data)
    
    # Send OTP
    if request_data.email:
        send_otp_via_email(request_data.email, otp)
        contact = request_data.email
    else:
        await send_otp_via_sms(request_data.phone, otp)
        contact = request_data.phone
    
    return {
        "success": True,
        "message": f"OTP sent to {contact}",
        "otp_id": str(result.inserted_id)
    }

@router.post("/verify-otp")
async def verify_otp(request_data: VerifyOTPRequest, db=Depends(get_db)):
    """Verify OTP and create/login user"""
    
    if not request_data.email and not request_data.phone:
        raise HTTPException(status_code=400, detail="Email or phone number is required")
    
    if not request_data.otp:
        raise HTTPException(status_code=400, detail="OTP is required")
    
    # Find OTP in database
    otps_collection = db["otps"]
    query = {}
    if request_data.email:
        query["email"] = request_data.email
    else:
        query["phone"] = request_data.phone
    
    # Get the most recent OTP for this contact
    otp_record = await otps_collection.find_one(query, sort=[("created_at", -1)])
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="No OTP found for this contact")
    
    # Check if OTP is expired
    if datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Check if OTP is correct
    if otp_record["otp"] != request_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Mark OTP as verified
    await otps_collection.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"verified": True}}
    )
    
    # Find or create user
    users_collection = db["users"]
    query = {}
    if request_data.email:
        query["email"] = request_data.email
    else:
        query["phone"] = request_data.phone
    
    user = await users_collection.find_one(query)
    
    if not user:
        # Create new user with email/phone verified status
        user_data = {
            "email": request_data.email,
            "phone": request_data.phone,
            "email_verified": bool(request_data.email),
            "phone_verified": bool(request_data.phone),
            "dob": None,
            "zodiac_sign": None,
            "created_at": datetime.utcnow()
        }
        result = await users_collection.insert_one(user_data)
        user = await users_collection.find_one({"_id": result.inserted_id})
    else:
        # Mark email or phone as verified if user already exists
        update_data = {}
        if request_data.email:
            update_data["email_verified"] = True
        if request_data.phone:
            update_data["phone_verified"] = True
        
        if update_data:
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            user = await users_collection.find_one({"_id": user["_id"]})
    
    return {
        "success": True,
        "message": "OTP verified successfully",
        "user": {
            "id": str(user["_id"]),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "email_verified": user.get("email_verified", False),
            "phone_verified": user.get("phone_verified", False),
            "dob": user.get("dob"),
            "zodiac_sign": user.get("zodiac_sign")
        }
    }

@router.get("/user/{user_id}")
async def get_user(user_id: str, db=Depends(get_db)):
    """Get user details"""
    from bson import ObjectId
    
    try:
        users_collection = db["users"]
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": str(user["_id"]),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "email_verified": user.get("email_verified", False),
            "phone_verified": user.get("phone_verified", False),
            "dob": user.get("dob"),
            "zodiac_sign": user.get("zodiac_sign")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
