from fastapi import APIRouter, Depends, HTTPException, Request
from models import RequestOTPRequest, RegisterRequest, VerifyOTPRequest, FreeAccessRequest, User
from utils import generate_otp, send_otp_via_email, send_otp_via_sms
from datetime import datetime, timedelta, timezone
import os

router = APIRouter()

FREE_USER_TYPE = "free"
REGISTERED_USER_TYPE = "registered"

# Shared message so every gated endpoint gives the frontend the same prompt.
FREE_USER_BLOCKED_DETAIL = (
    "This feature is available to registered users only. Please register to continue."
)


def is_free_user(user) -> bool:
    """True for users created through the 'Use as Free' flow.

    Documents predating free access have no user_type and are registered users.
    """
    return bool(user) and user.get("user_type") == FREE_USER_TYPE


async def get_db(request: Request):
    return request.app.db


def _iso_utc(dt):
    """Serialize a datetime as a UTC ISO string ending in 'Z', or None."""
    if not dt:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.isoformat() + "Z"

@router.post("/register")
async def register(request_data: RegisterRequest, db=Depends(get_db)):
    """Register a new user with name, email, and phone"""

    users_collection = db["users"]

    # Check if user already exists by email or phone
    existing_user = await users_collection.find_one({
        "$or": [{"email": request_data.email}, {"phone": request_data.phone}]
    })
    # A free user registering is an upgrade of their existing record (same _id,
    # so their DOB and prediction history survive) — only a real account blocks.
    if existing_user and not is_free_user(existing_user):
        raise HTTPException(status_code=409, detail="User already registered. Please login instead.")

    # Generate OTP
    otp = await generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_data = {
        "name": request_data.name,
        "email": request_data.email,
        "phone": request_data.phone,
        "otp": otp,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "verified": False,
        "type": "registration"
    }

    otps_collection = db["otps"]
    result = await otps_collection.insert_one(otp_data)

    await send_otp_via_email(str(request_data.email), otp)

    return {
        "success": True,
        "message": f"OTP sent to {request_data.email}. Please verify to complete registration.",
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

    if is_free_user(user):
        raise HTTPException(
            status_code=404,
            detail="You're using free access. Please register to unlock full features.",
        )

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
        await send_otp_via_email(request_data.email, otp)
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
        # Create new user — pull name and phone stored in the OTP record
        user_data = {
            "name": otp_record.get("name"),
            "email": request_data.email,
            "phone": otp_record.get("phone") or request_data.phone,
            "email_verified": bool(request_data.email),
            "phone_verified": bool(request_data.phone),
            "dob": None,
            "zodiac_sign": None,
            "user_type": REGISTERED_USER_TYPE,
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

        if is_free_user(user):
            # Upgrade in place: same _id, so the DOB and predictions captured
            # during free access carry over to the registered account.
            update_data["user_type"] = REGISTERED_USER_TYPE
            if otp_record.get("name") and not user.get("name"):
                update_data["name"] = otp_record["name"]
            if otp_record.get("phone") and not user.get("phone"):
                update_data["phone"] = otp_record["phone"]

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
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "email_verified": user.get("email_verified", False),
            "phone_verified": user.get("phone_verified", False),
            "dob": user.get("dob"),
            "zodiac_sign": user.get("zodiac_sign"),
            "user_type": user.get("user_type", REGISTERED_USER_TYPE)
        }
    }

@router.post("/free-access")
async def free_access(request_data: FreeAccessRequest, db=Depends(get_db)):
    """Create (or reuse) a free user from the 'Use as Free' form.

    No OTP is sent — free access is deliberately unverified. The record lives in
    the same `users` collection as registered users so the existing prediction
    endpoints keep working, and is marked with user_type='free' so every paid
    feature can reject it.
    """
    users_collection = db["users"]

    existing_user = await users_collection.find_one({
        "$or": [{"email": request_data.email}, {"phone": request_data.phone}]
    })

    if existing_user and not is_free_user(existing_user):
        raise HTTPException(
            status_code=409,
            detail="This email or phone is already registered. Please login instead.",
        )

    if existing_user:
        # Returning free visitor: refresh their details, keep the same _id.
        await users_collection.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {
                "name": request_data.name,
                "email": request_data.email,
                "phone": request_data.phone,
                "dob": request_data.dob,
            }},
        )
        user = await users_collection.find_one({"_id": existing_user["_id"]})
    else:
        user_data = {
            "name": request_data.name,
            "email": request_data.email,
            "phone": request_data.phone,
            "email_verified": False,
            "phone_verified": False,
            "dob": request_data.dob,
            "zodiac_sign": None,
            "user_type": FREE_USER_TYPE,
            "created_at": datetime.utcnow(),
        }
        result = await users_collection.insert_one(user_data)
        user = await users_collection.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "message": "Free access granted",
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "email_verified": user.get("email_verified", False),
            "phone_verified": user.get("phone_verified", False),
            "dob": user.get("dob"),
            "zodiac_sign": user.get("zodiac_sign"),
            "user_type": user.get("user_type", FREE_USER_TYPE),
        },
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
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "email_verified": user.get("email_verified", False),
            "phone_verified": user.get("phone_verified", False),
            "dob": user.get("dob"),
            "zodiac_sign": user.get("zodiac_sign"),
            "user_type": user.get("user_type", REGISTERED_USER_TYPE),
            "know_more_access": user.get("know_more_access", False),
            "know_more_tokens": user.get("know_more_tokens", 0),
            "know_more_view_expires_at": _iso_utc(user.get("know_more_view_expires_at")),
            "has_purchased_know_more": user.get("has_purchased_know_more", False),
            "report_logo_access": user.get("report_logo_access", False),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
