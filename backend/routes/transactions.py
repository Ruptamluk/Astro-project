"""Razorpay transactions & revenue endpoints (admin only).

Payments are synced from the Razorpay API into a local `razorpay_payments`
collection (idempotent upsert by payment id), and all analytics read from there
for speed + full history. Reuses the same credentials as routes/payment.py.
"""

import csv
import io
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

import razorpay

from routes.admin import require_admin, get_db, iso_utc

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

_WINDOWS = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
}


def _client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


def _match(window: str) -> dict:
    """Mongo match for a window; 'all' => no time filter (previous + latest)."""
    if window == "all":
        return {}
    delta = _WINDOWS.get(window, _WINDOWS["7d"])
    return {"created_at": {"$gte": datetime.utcnow() - delta}}


def _pct(curr: float, prev: float):
    if prev == 0:
        return None if curr == 0 else 100.0
    return round((curr - prev) / prev * 100.0, 1)


def _doc_from_payment(p: dict, notes: dict) -> dict:
    amount = p.get("amount") or 0
    fee = p.get("fee") or 0
    tax = p.get("tax") or 0
    return {
        "_id": p["id"],
        "amount": amount,
        "amount_rupees": round(amount / 100, 2),
        "currency": p.get("currency"),
        "status": p.get("status"),
        "captured": bool(p.get("captured")),
        "method": p.get("method"),
        "email": p.get("email"),
        "contact": p.get("contact"),
        "fee": fee,
        "tax": tax,
        "fee_rupees": round((fee + tax) / 100, 2),
        "order_id": p.get("order_id"),
        "created_at": datetime.utcfromtimestamp(p["created_at"]) if p.get("created_at") else None,
        "error_code": p.get("error_code"),
        "error_description": p.get("error_description"),
        "description": p.get("description"),
        "notes": notes or p.get("notes") or {},
        "payment_type": (notes or {}).get("payment_type"),
        "user_id": (notes or {}).get("user_id"),
        "tokens": (notes or {}).get("tokens"),
        "synced_at": datetime.utcnow(),
    }


@router.post("/sync")
async def sync(request: Request, admin=Depends(require_admin), db=Depends(get_db)):
    client = _client()
    if client is None:
        return {"configured": False, "synced": 0, "total": 0}

    # incremental: only fetch payments newer than what we already have
    last = await db.razorpay_payments.find_one({}, sort=[("created_at", -1)])
    from_epoch = None
    if last and last.get("created_at"):
        from_epoch = int(last["created_at"].timestamp()) + 1

    # collect order notes by paging orders (join on order_id)
    order_notes: dict[str, dict] = {}
    skip = 0
    while True:
        opts = {"count": 100, "skip": skip}
        if from_epoch:
            opts["from"] = from_epoch
        batch = client.order.all(opts)
        items = batch.get("items", [])
        for o in items:
            order_notes[o["id"]] = o.get("notes", {}) or {}
        if len(items) < 100:
            break
        skip += 100

    synced = 0
    skip = 0
    while True:
        opts = {"count": 100, "skip": skip}
        if from_epoch:
            opts["from"] = from_epoch
        batch = client.payment.all(opts)
        items = batch.get("items", [])
        for p in items:
            notes = order_notes.get(p.get("order_id"), {})
            doc = _doc_from_payment(p, notes)
            await db.razorpay_payments.update_one(
                {"_id": doc["_id"]}, {"$set": doc}, upsert=True
            )
            synced += 1
        if len(items) < 100:
            break
        skip += 100

    await db.razorpay_sync.update_one(
        {"_id": "transactions"},
        {"$set": {"last_sync_at": datetime.utcnow(), "synced_last": synced}},
        upsert=True,
    )
    total = await db.razorpay_payments.count_documents({})
    return {"configured": True, "synced": synced, "total": total}


@router.get("/sync-status")
async def sync_status(request: Request, admin=Depends(require_admin), db=Depends(get_db)):
    doc = await db.razorpay_sync.find_one({"_id": "transactions"})
    total = await db.razorpay_payments.count_documents({})
    return {
        "configured": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
        "last_sync_at": iso_utc(doc.get("last_sync_at")) if doc else None,
        "total": total,
    }


async def _revenue(db, match) -> tuple[float, float]:
    """Return (gross, net) rupees for captured payments matching `match`."""
    rows = await db.razorpay_payments.aggregate([
        {"$match": {**match, "status": "captured"}},
        {"$group": {
            "_id": None,
            "gross": {"$sum": "$amount_rupees"},
            "fees": {"$sum": "$fee_rupees"},
        }},
    ]).to_list(length=1)
    if not rows:
        return 0.0, 0.0
    gross = round(rows[0]["gross"], 2)
    net = round(gross - rows[0]["fees"], 2)
    return gross, net


@router.get("/summary")
async def summary(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "30d"):
    col = db.razorpay_payments
    cur = _match(window)

    async def count(extra=None):
        return await col.count_documents({**cur, **(extra or {})})

    gross, net = await _revenue(db, cur)
    total = await count()
    captured = await count({"status": "captured"})
    failed = await count({"status": "failed"})
    refunded = await count({"status": "refunded"})
    avg_order = round(gross / captured, 2) if captured else 0.0

    # previous-period deltas (only when windowed)
    delta_gross = None
    delta_txns = None
    if window in _WINDOWS:
        delta = _WINDOWS[window]
        now = datetime.utcnow()
        prev_match = {"created_at": {"$gte": now - 2 * delta, "$lt": now - delta}}
        prev_gross, _ = await _revenue(db, prev_match)
        prev_total = await col.count_documents(prev_match)
        delta_gross = _pct(gross, prev_gross)
        delta_txns = _pct(total, prev_total)

    return {
        "window": window,
        "configured": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
        "gross_revenue": gross,
        "net_revenue": net,
        "delta_gross_pct": delta_gross,
        "total_transactions": total,
        "delta_txns_pct": delta_txns,
        "successful": captured,
        "failed": failed,
        "refunded": refunded,
        "avg_order_value": avg_order,
    }


@router.get("/timeline")
async def timeline(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "30d"):
    match = _match(window)
    hourly = window == "24h"
    fmt = "%Y-%m-%dT%H:00" if hourly else "%Y-%m-%d"
    rows = await db.razorpay_payments.aggregate([
        {"$match": match},
        {"$group": {
            "_id": {
                "bucket": {"$dateToString": {"format": fmt, "date": "$created_at"}},
                "status": "$status",
            },
            "n": {"$sum": 1},
            "revenue": {"$sum": {"$cond": [{"$eq": ["$status", "captured"]}, "$amount_rupees", 0]}},
        }},
    ]).to_list(length=20000)

    buckets: dict[str, dict] = {}
    for r in rows:
        b = r["_id"]["bucket"]
        if not b:
            continue
        d = buckets.setdefault(b, {"bucket": b, "revenue": 0.0, "success": 0, "failure": 0})
        d["revenue"] += r["revenue"]
        if r["_id"]["status"] == "captured":
            d["success"] += r["n"]
        elif r["_id"]["status"] == "failed":
            d["failure"] += r["n"]

    series = sorted(buckets.values(), key=lambda x: x["bucket"])
    for s in series:
        s["revenue"] = round(s["revenue"], 2)
    return {"window": window, "series": series}


@router.get("/by-method")
async def by_method(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "30d"):
    rows = await db.razorpay_payments.aggregate([
        {"$match": {**_match(window), "status": "captured"}},
        {"$group": {"_id": "$method", "count": {"$sum": 1}, "revenue": {"$sum": "$amount_rupees"}}},
        {"$sort": {"revenue": -1}},
    ]).to_list(length=20)
    return {"methods": [
        {"method": r["_id"] or "unknown", "count": r["count"], "revenue": round(r["revenue"], 2)}
        for r in rows
    ]}


@router.get("/by-type")
async def by_type(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "30d"):
    rows = await db.razorpay_payments.aggregate([
        {"$match": {**_match(window), "status": "captured"}},
        {"$group": {"_id": "$payment_type", "count": {"$sum": 1}, "revenue": {"$sum": "$amount_rupees"}}},
        {"$sort": {"revenue": -1}},
    ]).to_list(length=20)
    return {"types": [
        {"type": r["_id"] or "unknown", "count": r["count"], "revenue": round(r["revenue"], 2)}
        for r in rows
    ]}


def _tx_query(search: str, status: str, method: str, window: str) -> dict:
    q = dict(_match(window))
    if status and status != "all":
        q["status"] = status
    if method and method != "all":
        q["method"] = method
    if search.strip():
        rx = {"$regex": search.strip(), "$options": "i"}
        q["$or"] = [
            {"_id": rx}, {"email": rx}, {"contact": rx}, {"user_id": rx},
            {"order_id": rx}, {"payment_type": rx},
        ]
    return q


def _tx_row(p: dict) -> dict:
    return {
        "id": p["_id"],
        "created_at": iso_utc(p.get("created_at")),
        "amount_rupees": p.get("amount_rupees"),
        "currency": p.get("currency"),
        "status": p.get("status"),
        "method": p.get("method"),
        "email": p.get("email"),
        "user_id": p.get("user_id"),
        "payment_type": p.get("payment_type"),
    }


@router.get("/transactions")
async def transactions(
    request: Request, admin=Depends(require_admin), db=Depends(get_db),
    search: str = "", status: str = "all", method: str = "all",
    window: str = "30d", page: int = 0, limit: int = 25,
):
    limit = max(1, min(limit, 100))
    q = _tx_query(search, status, method, window)
    total = await db.razorpay_payments.count_documents(q)
    docs = await db.razorpay_payments.find(q).sort("created_at", -1).skip(page * limit).limit(limit).to_list(length=limit)
    return {"total": total, "page": page, "limit": limit, "transactions": [_tx_row(d) for d in docs]}


@router.get("/transactions/export")
async def export_transactions(
    request: Request, admin=Depends(require_admin), db=Depends(get_db),
    search: str = "", status: str = "all", method: str = "all", window: str = "30d",
):
    q = _tx_query(search, status, method, window)
    docs = await db.razorpay_payments.find(q).sort("created_at", -1).limit(10000).to_list(length=10000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["payment_id", "created_at", "amount_inr", "status", "method", "email",
                "user_id", "payment_type", "fee_inr", "order_id"])
    for p in docs:
        w.writerow([
            p["_id"], iso_utc(p.get("created_at")), p.get("amount_rupees"), p.get("status"),
            p.get("method"), p.get("email"), p.get("user_id"), p.get("payment_type"),
            p.get("fee_rupees"), p.get("order_id"),
        ])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=transactions.csv"})


@router.get("/transactions/{payment_id}")
async def transaction_detail(payment_id: str, request: Request, admin=Depends(require_admin), db=Depends(get_db)):
    p = await db.razorpay_payments.find_one({"_id": payment_id})
    if not p:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    raw = {k: (iso_utc(v) if isinstance(v, datetime) else v) for k, v in p.items()}
    return {
        "id": p["_id"],
        "created_at": iso_utc(p.get("created_at")),
        "amount_rupees": p.get("amount_rupees"),
        "fee_rupees": p.get("fee_rupees"),
        "currency": p.get("currency"),
        "status": p.get("status"),
        "method": p.get("method"),
        "email": p.get("email"),
        "contact": p.get("contact"),
        "user_id": p.get("user_id"),
        "payment_type": p.get("payment_type"),
        "tokens": p.get("tokens"),
        "order_id": p.get("order_id"),
        "error_code": p.get("error_code"),
        "error_description": p.get("error_description"),
        "notes": p.get("notes"),
        "raw_payload": raw,
    }
