"""Admin portal endpoints — additive only.

This module never modifies existing user/auth/payment flows. It:
  * authenticates admins against a separate `admins` collection (hashed passwords),
  * issues opaque, expiring session tokens stored in `admin_sessions`,
  * grants Know More tokens / report-logo access by email (the same writes the
    one-off scripts `grant_know_more_tokens.py` / `grant_report_logo_access.py` do),
  * reports users and per-user activity assembled READ-ONLY from existing
    collections (`users`, `otps`).

Password hashing uses stdlib PBKDF2-HMAC-SHA256 (no third-party crypto needed).
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import hashlib
import hmac
import secrets
import re

router = APIRouter()


# --- shared helpers (kept local so this module has no import side effects) ----

# Mirrors VIEW_WINDOW_SECONDS in routes/payment.py — one token unlocks one visit.
VIEW_WINDOW_SECONDS = 20 * 60

# Opaque admin session lifetime.
SESSION_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 days

# PBKDF2 parameters.
_PBKDF2_ITERATIONS = 200_000


async def get_db(request: Request):
    return request.app.db


def iso_utc(dt: Optional[datetime]) -> Optional[str]:
    """Serialize a datetime as a UTC ISO string ending in 'Z', or None."""
    if not dt:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.isoformat() + "Z"


def email_query(email: str) -> dict:
    """Case-insensitive exact email match (registration stores email as-given)."""
    return {"email": {"$regex": f"^{re.escape(email.strip())}$", "$options": "i"}}


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), _PBKDF2_ITERATIONS
    ).hex()
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt, digest = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        computed = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt), int(iterations)
        ).hex()
        return hmac.compare_digest(computed, digest)
    except (ValueError, AttributeError):
        return False


# --- auth dependency ----------------------------------------------------------

async def require_admin(request: Request, authorization: Optional[str] = Header(None)):
    """Validate the Bearer admin session token; return the admin doc or 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    token = authorization.split(" ", 1)[1].strip()
    db = request.app.db
    session = await db.admin_sessions.find_one({"_id": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    expires_at = session.get("expires_at")
    if expires_at and expires_at.tzinfo is not None:
        expires_at = expires_at.astimezone(timezone.utc).replace(tzinfo=None)
    if expires_at and expires_at < datetime.utcnow():
        await db.admin_sessions.delete_one({"_id": token})
        raise HTTPException(status_code=401, detail="Session expired")
    return {"session": session, "token": token, "email": session.get("admin_email")}


# --- request models -----------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class GrantTokensRequest(BaseModel):
    email: str
    amount: int
    mode: str = "set"  # "set" | "add"


class GrantReportLogoRequest(BaseModel):
    email: str
    grant: bool = True


# --- auth endpoints -----------------------------------------------------------

@router.post("/login")
async def admin_login(body: LoginRequest, db=Depends(get_db)):
    admin = await db.admins.find_one(email_query(body.email))
    if not admin or not verify_password(body.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    await db.admin_sessions.insert_one({
        "_id": token,
        "admin_id": str(admin["_id"]),
        "admin_email": admin.get("email"),
        "created_at": now,
        "expires_at": now + timedelta(seconds=SESSION_TTL_SECONDS),
    })
    return {
        "token": token,
        "admin": {"email": admin.get("email"), "name": admin.get("name")},
    }


@router.post("/logout")
async def admin_logout(admin=Depends(require_admin), db=Depends(get_db)):
    await db.admin_sessions.delete_one({"_id": admin["token"]})
    return {"success": True}


@router.get("/me")
async def admin_me(admin=Depends(require_admin), db=Depends(get_db)):
    doc = await db.admins.find_one(email_query(admin["email"]))
    if not doc:
        raise HTTPException(status_code=401, detail="Admin not found")
    return {"email": doc.get("email"), "name": doc.get("name")}


# --- grant endpoints ----------------------------------------------------------

@router.post("/grant-tokens")
async def grant_tokens(body: GrantTokensRequest, admin=Depends(require_admin), db=Depends(get_db)):
    if body.mode not in ("set", "add"):
        raise HTTPException(status_code=400, detail="mode must be 'set' or 'add'")
    if body.amount < 0:
        raise HTTPException(status_code=400, detail="amount must be >= 0")

    user = await db.users.find_one(email_query(body.email))
    if not user:
        raise HTTPException(status_code=404, detail="No account found for that email")

    now = datetime.utcnow()
    expires_at = now + timedelta(seconds=VIEW_WINDOW_SECONDS)
    prev = user.get("know_more_tokens", 0)

    fields = {
        "know_more_view_expires_at": expires_at,
        "know_more_access": True,
    }
    # A set-to-0 is a revocation, so it must not confer archive access.
    if body.amount > 0:
        fields["has_purchased_know_more"] = True

    if body.mode == "set":
        update = {"$set": {**fields, "know_more_tokens": body.amount}}
    else:  # add
        update = {
            "$inc": {"know_more_tokens": body.amount},
            "$set": fields,
        }

    await db.users.update_one({"_id": user["_id"]}, update)
    refreshed = await db.users.find_one({"_id": user["_id"]})
    new_balance = refreshed.get("know_more_tokens", 0)

    await db.admin_audit.insert_one({
        "type": "grant_tokens",
        "admin_email": admin["email"],
        "email": user.get("email"),
        "user_id": str(user["_id"]),
        "mode": body.mode,
        "amount": body.amount,
        "previous": prev,
        "new_balance": new_balance,
        "ts": now,
    })

    return {
        "success": True,
        "email": user.get("email"),
        "previous": prev,
        "new_balance": new_balance,
        "know_more_view_expires_at": iso_utc(expires_at),
    }


@router.post("/grant-report-logo")
async def grant_report_logo(body: GrantReportLogoRequest, admin=Depends(require_admin), db=Depends(get_db)):
    user = await db.users.find_one(email_query(body.email))
    if not user:
        raise HTTPException(status_code=404, detail="No account found for that email")

    now = datetime.utcnow()
    prev = bool(user.get("report_logo_access", False))
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"report_logo_access": bool(body.grant)}},
    )
    await db.admin_audit.insert_one({
        "type": "report_logo",
        "admin_email": admin["email"],
        "email": user.get("email"),
        "user_id": str(user["_id"]),
        "grant": bool(body.grant),
        "previous": prev,
        "ts": now,
    })
    return {
        "success": True,
        "email": user.get("email"),
        "report_logo_access": bool(body.grant),
    }


# --- read-only reporting ------------------------------------------------------

async def _last_login_at(db, user) -> Optional[datetime]:
    """Most recent verified login OTP for this user (read-only from `otps`)."""
    or_clauses = []
    if user.get("email"):
        or_clauses.append({"email": user["email"]})
    if user.get("phone"):
        or_clauses.append({"phone": user["phone"]})
    if not or_clauses:
        return None
    rec = await db.otps.find_one(
        {"$or": or_clauses, "type": "login", "verified": True},
        sort=[("created_at", -1)],
    )
    return rec.get("created_at") if rec else None


@router.get("/users")
async def list_users(
    admin=Depends(require_admin),
    db=Depends(get_db),
    search: str = "",
    page: int = 0,
    limit: int = 25,
):
    limit = max(1, min(limit, 100))
    query: dict = {}
    if search.strip():
        query["email"] = {"$regex": re.escape(search.strip()), "$options": "i"}

    total = await db.users.count_documents(query)
    cursor = (
        db.users.find(query)
        .sort("created_at", -1)
        .skip(page * limit)
        .limit(limit)
    )
    users = await cursor.to_list(length=limit)

    rows = []
    for u in users:
        last_login = await _last_login_at(db, u)
        rows.append({
            "id": str(u["_id"]),
            "name": u.get("name"),
            "email": u.get("email"),
            "phone": u.get("phone"),
            "created_at": iso_utc(u.get("created_at")),
            "last_login_at": iso_utc(last_login),
            "know_more_tokens": u.get("know_more_tokens", 0),
            "know_more_view_expires_at": iso_utc(u.get("know_more_view_expires_at")),
            "report_logo_access": bool(u.get("report_logo_access", False)),
        })

    return {"total": total, "page": page, "limit": limit, "users": rows}


@router.get("/users/{user_id}/activity")
async def user_activity(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    events = []

    # Account created
    if user.get("created_at"):
        events.append({"type": "account_created", "ts": iso_utc(user["created_at"]), "detail": "Account created"})

    # Login / registration events (read-only from otps)
    or_clauses = []
    if user.get("email"):
        or_clauses.append({"email": user["email"]})
    if user.get("phone"):
        or_clauses.append({"phone": user["phone"]})
    if or_clauses:
        otp_cursor = db.otps.find(
            {"$or": or_clauses, "verified": True}
        ).sort("created_at", -1).limit(100)
        async for rec in otp_cursor:
            events.append({
                "type": rec.get("type", "login"),
                "ts": iso_utc(rec.get("created_at")),
                "detail": f"{rec.get('type', 'login').capitalize()} verified",
            })

    # Last Know More view window
    exp = user.get("know_more_view_expires_at")
    if exp:
        start = exp - timedelta(seconds=VIEW_WINDOW_SECONDS)
        events.append({
            "type": "know_more_view",
            "ts": iso_utc(start),
            "detail": f"Know More view (window until {iso_utc(exp)})",
        })

    # Admin grants for this user
    audit_cursor = db.admin_audit.find({"user_id": user_id}).sort("ts", -1).limit(100)
    async for a in audit_cursor:
        if a.get("type") == "grant_tokens":
            detail = f"Admin {a.get('admin_email')} {a.get('mode')} tokens -> {a.get('new_balance')}"
        else:
            detail = f"Admin {a.get('admin_email')} {'granted' if a.get('grant') else 'revoked'} report-logo"
        events.append({"type": f"admin_{a.get('type')}", "ts": iso_utc(a.get("ts")), "detail": detail})

    events.sort(key=lambda e: (e["ts"] or ""), reverse=True)
    return {
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "know_more_tokens": user.get("know_more_tokens", 0),
            "report_logo_access": bool(user.get("report_logo_access", False)),
        },
        "events": events,
    }


@router.get("/stats")
async def stats(admin=Depends(require_admin), db=Depends(get_db)):
    total_users = await db.users.count_documents({})
    since = datetime.utcnow() - timedelta(hours=24)
    active_24h = len(await db.otps.distinct(
        "email", {"type": "login", "verified": True, "created_at": {"$gte": since}}
    ))
    agg = await db.users.aggregate([
        {"$group": {"_id": None, "tokens": {"$sum": "$know_more_tokens"}}}
    ]).to_list(length=1)
    tokens_outstanding = agg[0]["tokens"] if agg else 0
    return {
        "total_users": total_users,
        "active_24h": active_24h,
        "tokens_outstanding": tokens_outstanding,
    }
