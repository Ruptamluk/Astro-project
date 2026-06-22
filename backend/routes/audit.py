"""Audit Logs & Observability endpoints (read-only over the `audit_logs` collection).

All endpoints require an admin session (reuses require_admin from routes.admin).
"""

import csv
import io
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from routes.admin import require_admin, get_db, iso_utc

router = APIRouter()

_WINDOWS = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
}


def _window_delta(window: str) -> timedelta:
    return _WINDOWS.get(window, _WINDOWS["7d"])


def _ts_match(window: str) -> dict:
    """ts filter for a window; 'all' => no filter (previous + latest)."""
    if window == "all":
        return {}
    return {"ts": {"$gte": datetime.utcnow() - _window_delta(window)}}


def _pct(curr: int, prev: int):
    if prev == 0:
        return None if curr == 0 else 100.0
    return round((curr - prev) / prev * 100.0, 1)


@router.get("/summary")
async def summary(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "7d"):
    now = datetime.utcnow()
    col = db.audit_logs
    all_time = window == "all"

    async def count(match):
        return await col.count_documents(match)

    if all_time:
        cur: dict = {}
        prev: dict = {"ts": {"$lt": datetime.min}}  # matches nothing → deltas become None
    else:
        delta = _window_delta(window)
        cur_start = now - delta
        cur = {"ts": {"$gte": cur_start}}
        prev = {"ts": {"$gte": now - 2 * delta, "$lt": cur_start}}

    total = await count(cur)
    total_prev = await count(prev)
    success = await count({**cur, "status": "success"})
    success_prev = await count({**prev, "status": "success"})
    warnings = await count({**cur, "severity": "warning"})
    warnings_prev = await count({**prev, "severity": "warning"})
    errors = await count({**cur, "severity": "error"})
    errors_prev = await count({**prev, "severity": "error"})
    security = await count({**cur, "is_security": True})
    security_prev = await count({**prev, "is_security": True})

    failed_logins = await count({
        **cur, "status": "failure",
        "path": {"$regex": "/(login|verify-otp)$"},
    })
    failed_logins_prev = await count({
        **prev, "status": "failure",
        "path": {"$regex": "/(login|verify-otp)$"},
    })

    critical_24h = await count({"ts": {"$gte": now - timedelta(hours=24)}, "severity": "error"})
    active_users = len(await col.distinct("user_id", {**cur, "user_id": {"$ne": None}}))

    top_mod = await col.aggregate([
        {"$match": cur},
        {"$group": {"_id": "$module", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": 1},
    ]).to_list(length=1)
    top_module = top_mod[0]["_id"] if top_mod else "—"
    top_module_share = round(top_mod[0]["n"] / total * 100) if top_mod and total else 0

    def card(value, prev_value):
        return {"value": value, "delta_pct": None if all_time else _pct(value, prev_value)}

    return {
        "window": window,
        "total_events": card(total, total_prev),
        "success": card(success, success_prev),
        "warnings": card(warnings, warnings_prev),
        "errors": card(errors, errors_prev),
        "security_events": card(security, security_prev),
        "failed_logins": card(failed_logins, failed_logins_prev),
        "critical_24h": {"value": critical_24h, "delta_pct": None},
        "active_users": {"value": active_users, "delta_pct": None},
        "top_module": {"name": top_module, "share_pct": top_module_share},
    }


@router.get("/timeline")
async def timeline(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "7d"):
    now = datetime.utcnow()
    hourly = window == "24h"
    all_time = window == "all"

    fmt = "%Y-%m-%dT%H:00" if hourly else "%Y-%m-%d"
    rows = await db.audit_logs.aggregate([
        {"$match": _ts_match(window)},
        {"$group": {
            "_id": {
                "bucket": {"$dateToString": {"format": fmt, "date": "$ts"}},
                "status": "$status",
            },
            "n": {"$sum": 1},
        }},
    ]).to_list(length=20000)

    buckets: dict[str, dict] = {}
    for r in rows:
        b = r["_id"]["bucket"]
        buckets.setdefault(b, {"bucket": b, "success": 0, "failure": 0})
        key = "success" if r["_id"]["status"] == "success" else "failure"
        buckets[b][key] += r["n"]

    if all_time:
        # don't synthesize buckets across all history — just return what exists
        series = sorted(buckets.values(), key=lambda x: x["bucket"])
    else:
        # fill empty buckets for a continuous chart
        series = []
        step = timedelta(hours=1) if hourly else timedelta(days=1)
        t = now - _window_delta(window)
        while t <= now:
            b = t.strftime(fmt)
            series.append(buckets.get(b, {"bucket": b, "success": 0, "failure": 0}))
            t += step

    return {"window": window, "series": series}


@router.get("/status-breakdown")
async def status_breakdown(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "7d"):
    rows = await db.audit_logs.aggregate([
        {"$match": _ts_match(window)},
        {"$group": {"_id": {"status": "$status", "severity": "$severity"}, "n": {"$sum": 1}}},
    ]).to_list(length=1000)

    counts = {"success": 0, "failure": 0, "denied": 0, "warning": 0}
    for r in rows:
        status = r["_id"]["status"]
        severity = r["_id"]["severity"]
        if status == "success":
            counts["success"] += r["n"]
        elif severity == "warning":
            counts["warning"] += r["n"]
        else:
            counts["failure"] += r["n"]
    total = sum(counts.values())
    return {
        "window": window,
        "total": total,
        "breakdown": [
            {"key": k, "count": v, "pct": round(v / total * 100, 1) if total else 0}
            for k, v in counts.items()
        ],
    }


@router.get("/top-modules")
async def top_modules(request: Request, admin=Depends(require_admin), db=Depends(get_db), window: str = "7d", limit: int = 6):
    rows = await db.audit_logs.aggregate([
        {"$match": _ts_match(window)},
        {"$group": {"_id": "$module", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": limit},
    ]).to_list(length=limit)
    return {"window": window, "modules": [{"module": r["_id"] or "Other", "count": r["n"]} for r in rows]}


def _events_query(search: str, severity: str, status: str, window: str) -> dict:
    q: dict = dict(_ts_match(window))
    if severity and severity != "all":
        q["severity"] = severity
    if status and status != "all":
        q["status"] = status
    if search.strip():
        rx = {"$regex": search.strip(), "$options": "i"}
        q["$or"] = [
            {"action": rx}, {"module": rx}, {"user_id": rx},
            {"path": rx}, {"correlation_id": rx}, {"error_message": rx},
            {"error_code": rx},
        ]
    return q


def _row(e: dict) -> dict:
    return {
        "id": str(e["_id"]),
        "ts": iso_utc(e.get("ts")),
        "action": e.get("action"),
        "module": e.get("module"),
        "event_type": e.get("event_type"),
        "severity": e.get("severity"),
        "status": e.get("status"),
        "status_code": e.get("status_code"),
        "user_id": e.get("user_id"),
        "path": e.get("path"),
        "error_code": e.get("error_code"),
        "duration_ms": e.get("duration_ms"),
    }


@router.get("/events")
async def events(
    request: Request, admin=Depends(require_admin), db=Depends(get_db),
    search: str = "", severity: str = "all", status: str = "all",
    window: str = "7d", page: int = 0, limit: int = 25,
):
    limit = max(1, min(limit, 100))
    q = _events_query(search, severity, status, window)
    total = await db.audit_logs.count_documents(q)
    docs = await db.audit_logs.find(q).sort("ts", -1).skip(page * limit).limit(limit).to_list(length=limit)
    return {"total": total, "page": page, "limit": limit, "events": [_row(e) for e in docs]}


@router.get("/events/export")
async def export_events(
    request: Request, admin=Depends(require_admin), db=Depends(get_db),
    search: str = "", severity: str = "all", status: str = "all", window: str = "7d",
):
    q = _events_query(search, severity, status, window)
    docs = await db.audit_logs.find(q).sort("ts", -1).limit(5000).to_list(length=5000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["timestamp", "action", "module", "severity", "status", "status_code",
                     "user_id", "path", "error_code", "error_message", "duration_ms", "ip"])
    for e in docs:
        writer.writerow([
            iso_utc(e.get("ts")), e.get("action"), e.get("module"), e.get("severity"),
            e.get("status"), e.get("status_code"), e.get("user_id"), e.get("path"),
            e.get("error_code"), e.get("error_message"), e.get("duration_ms"), e.get("ip"),
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"},
    )


@router.get("/events/{event_id}")
async def event_detail(event_id: str, request: Request, admin=Depends(require_admin), db=Depends(get_db)):
    from bson import ObjectId
    try:
        oid = ObjectId(event_id)
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid event id")
    e = await db.audit_logs.find_one({"_id": oid})
    if not e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Event not found")

    raw = {k: (iso_utc(v) if isinstance(v, datetime) else v)
           for k, v in e.items() if k != "_id"}
    raw["id"] = str(e["_id"])
    return {
        "id": str(e["_id"]),
        "ts": iso_utc(e.get("ts")),
        "action": e.get("action"),
        "module": e.get("module"),
        "event_type": e.get("event_type"),
        "severity": e.get("severity"),
        "status": e.get("status"),
        "status_code": e.get("status_code"),
        "method": e.get("method"),
        "path": e.get("path"),
        "query": e.get("query"),
        "user_id": e.get("user_id"),
        "ip": e.get("ip"),
        "user_agent": e.get("user_agent"),
        "correlation_id": e.get("correlation_id"),
        "duration_ms": e.get("duration_ms"),
        "environment": e.get("environment"),
        "error_code": e.get("error_code"),
        "error_category": e.get("error_category"),
        "error_message": e.get("error_message"),
        "exception_type": e.get("exception_type"),
        "stack_trace": e.get("stack_trace"),
        "raw_payload": raw,
    }
