from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
import razorpay
import hmac
import hashlib
import os

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

TOKEN_PACKS = {
    "1":  (9900,   1),
    "5":  (30000,  5),
    "10": (50000, 10),
    "20": (80000, 20),
}

REPORT_LOGO_PRICE = 500000  # ₹5000 in paise


class CreateOrderRequest(BaseModel):
    user_id: str
    payment_type: str  # "know_more_token" | "report_logo"
    pack: Optional[str] = None  # "1" | "5" | "10" | "20"


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    payment_type: str
    tokens_to_grant: Optional[int] = 0


@router.post("/create-order")
async def create_order(body: CreateOrderRequest):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured")

    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    if body.payment_type == "know_more_token":
        if not body.pack or body.pack not in TOKEN_PACKS:
            raise HTTPException(status_code=400, detail="Invalid token pack")
        amount, tokens = TOKEN_PACKS[body.pack]
    elif body.payment_type == "report_logo":
        amount = REPORT_LOGO_PRICE
        tokens = 0
    else:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": f"{body.user_id}_{body.payment_type}",
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "tokens_to_grant": tokens,
    }


@router.post("/verify")
async def verify_payment(request: Request, body: VerifyPaymentRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured")

    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if expected != body.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    db = request.app.db

    if body.payment_type == "know_more_token":
        tokens = max(body.tokens_to_grant or 1, 1)
        await db.users.update_one(
            {"_id": ObjectId(body.user_id)},
            {"$inc": {"know_more_tokens": tokens}, "$set": {"know_more_access": True}},
        )
    elif body.payment_type == "report_logo":
        await db.users.update_one(
            {"_id": ObjectId(body.user_id)},
            {"$set": {"report_logo_access": True}},
        )

    return {"success": True}


@router.post("/consume-token/{user_id}")
async def consume_token(user_id: str, request: Request):
    db = request.app.db
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tokens = user.get("know_more_tokens", 0)

    if tokens <= 0:
        raise HTTPException(status_code=402, detail="No tokens available")

    new_tokens = tokens - 1
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"know_more_tokens": new_tokens, "know_more_access": new_tokens > 0}},
    )

    return {"tokens_remaining": new_tokens}
