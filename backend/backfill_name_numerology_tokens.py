"""One-off migration: add `name_numerology_tokens: 0` to existing users.

The app already treats a missing field as 0, so this is only so the field is
visible in the DB and can be edited there directly. Only users that do not
have the field are touched — existing balances are never overwritten.

Idempotent — safe to re-run.

Usage (from backend/):
    python backfill_name_numerology_tokens.py --dry-run   # report only, no writes
    python backfill_name_numerology_tokens.py             # apply the backfill
"""

import os
import sys
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"

QUERY = {"name_numerology_tokens": {"$exists": False}}


async def main(dry_run: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    print(f"=== Backfill name_numerology_tokens — {mode} ===")

    total = await db.users.count_documents({})
    missing = await db.users.count_documents(QUERY)
    print(f"total users:          {total}")
    print(f"missing the field:    {missing}")

    if not dry_run:
        res = await db.users.update_many(
            QUERY, {"$set": {"name_numerology_tokens": 0}}
        )
        print("\n=== Summary ===")
        print(f"matched:   {res.matched_count}")
        print(f"modified:  {res.modified_count}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv))
