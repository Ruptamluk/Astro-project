"""One-off migration: backfill `has_purchased_know_more` on existing users.

The flag gates the Report Archive and means "has ever held a Know More token".
It is set going forward by `credit_payment()` (routes/payment.py) and by admin
grants (routes/admin.py), but users who purchased before the field existed have
no record of it. This approximates the flag from their current state: anyone
holding tokens now, or carrying the legacy `know_more_access` flag, must have
been credited at some point.

Known gap: users who already spent every token down to zero are not caught —
nothing on their document records the purchase. They regain archive access on
their next purchase or admin grant.

Idempotent — safe to re-run.

Usage (from backend/):
    python backfill_has_purchased_know_more.py --dry-run   # report only, no writes
    python backfill_has_purchased_know_more.py             # apply the backfill
"""

import os
import sys
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"

# Users who must have been credited at some point.
QUERY = {"$or": [{"know_more_tokens": {"$gt": 0}}, {"know_more_access": True}]}


async def main(dry_run: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    print(f"=== Backfill has_purchased_know_more — {mode} ===")

    eligible = await db.users.count_documents(QUERY)
    already = await db.users.count_documents(
        {**QUERY, "has_purchased_know_more": True}
    )
    print(f"eligible (tokens > 0 or know_more_access):  {eligible}")
    print(f"already flagged:                           {already}")
    print(f"to update:                                 {eligible - already}")

    if not dry_run:
        res = await db.users.update_many(
            QUERY, {"$set": {"has_purchased_know_more": True}}
        )
        print("\n=== Summary ===")
        print(f"matched:   {res.matched_count}")
        print(f"modified:  {res.modified_count}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv))
