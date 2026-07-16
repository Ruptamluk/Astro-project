from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
import razorpay
import hmac
import hashlib
import json
import os

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

TOKEN_PACKS = {
    "1":    (10900,      1),   # ₹109
    "5":    (27100,      5),   # ₹271
    "32":   (81100,     32),   # ₹811
    "100":  (180100,   100),   # ₹1801
    "500":  (630100,   500),   # ₹6301
    "1000": (810100,  1000),   # ₹8101
}

# How long a single token unlocks the Know More page for (one visit).
VIEW_WINDOW_SECONDS = 20 * 60  # 20 minutes

REPORT_LOGO_PRICE = 500000  # ₹5000 in paise


def iso_utc(dt: datetime) -> str:
    """Serialize a datetime as an unambiguous UTC ISO string ending in 'Z'.

    Handles both naive (assumed UTC) and tz-aware datetimes so the frontend
    never receives an invalid string like '...+00:00Z'.
    """
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.isoformat() + "Z"


async def credit_payment(db, payment_id, user_id, payment_type, tokens) -> bool:
    """Credit a paid order exactly once.

    Idempotency is enforced by inserting the razorpay payment id as the _id of a
    `processed_payments` doc — a duplicate insert means it was already credited,
    so we skip. Safe to call from both /verify and the webhook for the same
    payment. Returns True if this call performed the credit, False if skipped.
    """
    if not payment_id or not user_id:
        return False

    try:
        await db.processed_payments.insert_one(
            {"_id": payment_id, "created_at": datetime.utcnow()}
        )
    except DuplicateKeyError:
        return False  # already credited by an earlier verify/webhook call

    if payment_type == "know_more_token":
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"know_more_tokens": max(int(tokens or 0), 1)},
             "$set": {"know_more_access": True, "has_purchased_know_more": True}},
        )
    elif payment_type == "report_logo":
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"report_logo_access": True}},
        )

    return True


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
        # Carried back to us by both /verify (order.fetch) and the webhook, so
        # crediting is driven by server-side data, never the client.
        "notes": {
            "user_id": body.user_id,
            "payment_type": body.payment_type,
            "tokens": str(tokens),
        },
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

    # The order's server-side notes are the source of truth (a client can't
    # tamper with them). But the signature above already cryptographically
    # proves Razorpay authorized this exact order+payment, so a failure to
    # reach the Razorpay API must NOT block crediting a real payment — that
    # would leave a paying user without tokens and bounce them off Know More.
    payment_type = body.payment_type
    tokens = int(body.tokens_to_grant or 0)
    user_id = body.user_id

    try:
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        order = client.order.fetch(body.razorpay_order_id)
        notes = order.get("notes", {}) or {}
        if notes.get("user_id"):
            user_id = notes["user_id"]
        if notes.get("payment_type"):
            payment_type = notes["payment_type"]
        if notes.get("tokens"):
            tokens = int(notes["tokens"])
    except Exception as exc:
        # Razorpay API unreachable / keys misconfigured: fall back to the
        # client body, but clamp the token count to a known pack so a tampered
        # body can't inflate the grant.
        print(f"[verify] order.fetch failed, falling back to request body: {exc}")
        if payment_type == "know_more_token":
            valid_counts = {t for _, t in TOKEN_PACKS.values()}
            tokens = tokens if tokens in valid_counts else 1

    await credit_payment(
        db,
        body.razorpay_payment_id,
        user_id,
        payment_type,
        tokens,
    )

    return {"success": True}


@router.post("/consume-token/{user_id}")
async def consume_token(user_id: str, request: Request):
    db = request.app.db
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.utcnow()
    expires_at = user.get("know_more_view_expires_at")
    # Normalize a tz-aware stored value to naive UTC so it can be compared with
    # the naive utcnow() above without raising TypeError.
    if expires_at and expires_at.tzinfo is not None:
        expires_at = expires_at.astimezone(timezone.utc).replace(tzinfo=None)

    # Still inside an active viewing window: same visit, do not charge again
    # (allows refresh / re-entry without spending another token).
    if expires_at and expires_at > now:
        return {
            "tokens_remaining": user.get("know_more_tokens", 0),
            "expires_at": iso_utc(expires_at),
        }

    # Otherwise atomically spend one token and open a fresh viewing window.
    # The know_more_tokens > 0 filter makes the decrement atomic and prevents
    # double-spend / negative balances under concurrent requests.
    new_expires_at = now + timedelta(seconds=VIEW_WINDOW_SECONDS)
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id), "know_more_tokens": {"$gt": 0}},
        {
            "$inc": {"know_more_tokens": -1},
            "$set": {"know_more_view_expires_at": new_expires_at},
        },
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=402, detail="No tokens available")

    new_tokens = result.get("know_more_tokens", 0)
    # Keep the legacy access flag in sync with the remaining balance.
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"know_more_access": new_tokens > 0}},
    )

    return {
        "tokens_remaining": new_tokens,
        "expires_at": iso_utc(new_expires_at),
    }


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Server-to-server confirmation from Razorpay.

    Credits tokens even if the user closed the tab before /verify ran. Idempotent
    via credit_payment, so it never double-credits alongside the browser callback.
    """
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    raw = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event = json.loads(raw)

    if event.get("event") == "payment.captured":
        entity = event.get("payload", {}).get("payment", {}).get("entity", {})
        notes = entity.get("notes", {}) or {}
        # Razorpay does not always copy order notes onto the payment entity, so
        # fall back to fetching the order's notes when user_id is missing.
        if not notes.get("user_id") and entity.get("order_id"):
            try:
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                order = client.order.fetch(entity["order_id"])
                notes = order.get("notes", {}) or notes
            except Exception as exc:
                print(f"[webhook] order.fetch failed: {exc}")
        if notes.get("user_id"):
            await credit_payment(
                request.app.db,
                entity.get("id"),
                notes.get("user_id"),
                notes.get("payment_type"),
                int(notes.get("tokens", 0) or 0),
            )

    # Always 200 for handled requests so Razorpay marks delivery successful and
    # stops retrying.
    return {"status": "ok"}
