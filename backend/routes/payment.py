from fastapi import APIRouter, Depends, HTTPException, Request
from models import CreateOrderRequest, VerifyPaymentRequest, UseTokenRequest
from pymongo import ReturnDocument
from bson import ObjectId
import razorpay
import hmac
import hashlib
import uuid
import os

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

TOKEN_PACK_PRICES = {1: 4900, 5: 19900, 10: 34900}  # in paise

async def get_db(request: Request):
    return request.app.db


@router.get("/tokens/{user_id}")
async def get_tokens(user_id: str, db=Depends(get_db)):
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"tokens": user.get("tokens", 0)}


@router.post("/create-order")
async def create_order(data: CreateOrderRequest, db=Depends(get_db)):
    if data.token_pack not in TOKEN_PACK_PRICES:
        raise HTTPException(status_code=400, detail="Invalid token pack. Choose 1, 5, or 10.")

    try:
        user = await db["users"].find_one({"_id": ObjectId(data.user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured")

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    amount = TOKEN_PACK_PRICES[data.token_pack]
    receipt = str(uuid.uuid4())[:20]

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": receipt,
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
    }


@router.post("/verify")
async def verify_payment(data: VerifyPaymentRequest, db=Depends(get_db)):
    if data.token_pack not in TOKEN_PACK_PRICES:
        raise HTTPException(status_code=400, detail="Invalid token pack")

    message = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if expected != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    try:
        result = await db["users"].find_one_and_update(
            {"_id": ObjectId(data.user_id)},
            {"$inc": {"tokens": data.token_pack}},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "tokens": result.get("tokens", 0)}


@router.post("/use-token")
async def use_token(data: UseTokenRequest, db=Depends(get_db)):
    try:
        user = await db["users"].find_one({"_id": ObjectId(data.user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("tokens", 0) < 1:
        raise HTTPException(status_code=402, detail="Insufficient tokens")

    # Atomic decrement — only succeeds if tokens >= 1
    result = await db["users"].find_one_and_update(
        {"_id": ObjectId(data.user_id), "tokens": {"$gte": 1}},
        {"$inc": {"tokens": -1}},
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=402, detail="Insufficient tokens")

    return {"success": True, "tokens": result.get("tokens", 0)}
