"""One-off admin script: grant report logo access to a fixed set of users.

Sets `report_logo_access = True` for each user, matched case-insensitively
by email (registration stores email as-given, see routes/auth.py).

Usage (from backend/):
    python grant_report_logo_access.py --dry-run   # report only, no writes
    python grant_report_logo_access.py             # apply the change
"""

import os
import re
import sys
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"

EMAILS = [
    "explore.rup95@gmail.com",
]


def email_query(email: str) -> dict:
    # Case-insensitive exact match: registration stores email as-given
    # (routes/auth.py), so some addresses contain uppercase letters.
    return {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}


async def main(dry_run: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    matched = 0
    modified = 0
    not_found = []

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    print(f"=== Grant report logo access — {mode} ===")
    print("Target: report_logo_access = True\n")

    for email in EMAILS:
        user = await db.users.find_one(email_query(email))
        if not user:
            not_found.append(email)
            print(f"[NOT FOUND] {email}")
            continue

        matched += 1
        current = user.get("report_logo_access", False)

        if dry_run:
            print(f"[would update] {email} (stored: {user.get('email')}) "
                  f"report_logo_access {current} -> True")
            continue

        res = await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"report_logo_access": True}},
        )
        modified += res.modified_count
        print(f"[updated] {email} (stored: {user.get('email')}) "
              f"report_logo_access {current} -> True")

    print("\n=== Summary ===")
    print(f"matched:   {matched}/{len(EMAILS)}")
    if not dry_run:
        print(f"modified:  {modified}")
    if not_found:
        print(f"NOT FOUND ({len(not_found)}): {', '.join(not_found)}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv))
