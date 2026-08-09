from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
from bson import ObjectId

from routes.auth import is_free_user, FREE_USER_BLOCKED_DETAIL

router = APIRouter()


async def get_db(request: Request):
    return request.app.db


async def _reject_free_user(db, user_obj_id: ObjectId) -> None:
    """Reports are a registered-user feature — free users get a 403."""
    user = await db.users.find_one({"_id": user_obj_id})
    if is_free_user(user):
        raise HTTPException(status_code=403, detail=FREE_USER_BLOCKED_DETAIL)

# Cap what we hand back so a heavy user can't blow up the archive dialog.
MAX_ARCHIVE_ENTRIES = 100


def iso_utc(dt: Optional[datetime]) -> Optional[str]:
    """UTC ISO string ending in 'Z' (mirrors routes/payment.py:iso_utc)."""
    if not dt:
        return None
    return dt.isoformat() + "Z"


class SaveReportRequest(BaseModel):
    dob: str
    name: Optional[str] = None
    phone: Optional[str] = None
    # Full prediction snapshot; the report is re-generated from this client-side.
    prediction: Dict[str, Any]


@router.post("/{user_id}")
async def save_report(user_id: str, body: SaveReportRequest, db=Depends(get_db)):
    """Archive a generated report.

    Keyed on (user_id, dob, name, phone) so re-downloading the same person's
    report refreshes the existing entry instead of piling up duplicates.
    """
    try:
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    await _reject_free_user(db, user_obj_id)

    if not body.dob:
        raise HTTPException(status_code=400, detail="dob is required")

    now = datetime.utcnow()
    key = {
        "user_id": str(user_obj_id),
        "dob": body.dob,
        "name": body.name or "",
        "phone": body.phone or "",
    }

    await db.reports.update_one(
        key,
        {
            "$set": {**key, "prediction": body.prediction, "updated_at": now},
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    return {"success": True}


@router.get("/{user_id}")
async def list_reports(user_id: str, db=Depends(get_db)):
    """Previously generated reports, newest first. Never consumes a token."""
    try:
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    await _reject_free_user(db, user_obj_id)

    cursor = (
        db.reports.find({"user_id": str(user_obj_id)})
        .sort("updated_at", -1)
        .limit(MAX_ARCHIVE_ENTRIES)
    )

    reports = []
    async for doc in cursor:
        reports.append({
            "id": str(doc["_id"]),
            "dob": doc.get("dob"),
            "name": doc.get("name") or "",
            "phone": doc.get("phone") or "",
            "prediction": doc.get("prediction") or {},
            "created_at": iso_utc(doc.get("created_at")),
            "updated_at": iso_utc(doc.get("updated_at")),
        })

    return {"reports": reports}
