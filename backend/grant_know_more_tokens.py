"""One-off admin script: grant 200 Know More tokens to a fixed set of users.

Sets `know_more_tokens = 200` and opens a fresh viewing window
(`know_more_view_expires_at = utcnow() + VIEW_WINDOW_SECONDS`) for each user,
matching the logic the app uses in `routes/payment.py:consume_token`.

Usage (from backend/):
    python grant_know_more_tokens.py --dry-run   # report only, no writes
    python grant_know_more_tokens.py             # apply the grant
"""

import os
import re
import sys
import asyncio
from datetime import datetime, timedelta

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"

# Same viewing-window length the app uses (routes/payment.py:VIEW_WINDOW_SECONDS).
VIEW_WINDOW_SECONDS = 20 * 60  # 20 minutes

TOKENS_TO_GRANT = 200

EMAILS = [
    "pratibha.kumar@gmail.com",
    "sanjeetsehgal1963@gmail.com",
    "priya101979@gmail.com",
    "agarwalarchana761@gmail.com",
    "kirantehan1967@gmail.com",
    "Pragatijoshi1973@gmail.com",
    "ashuashu1300@gmail.com",
    "mansagar2624@gmail.com",
    "Itsatulkjain@gmail.com",
]


def email_query(email: str) -> dict:
    # Case-insensitive exact match: registration stores email as-given
    # (routes/auth.py), so some addresses contain uppercase letters.
    return {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}


async def main(dry_run: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    expires_at = datetime.utcnow() + timedelta(seconds=VIEW_WINDOW_SECONDS)

    matched = 0
    modified = 0
    not_found = []

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    print(f"=== Grant Know More tokens — {mode} ===")
    print(f"Target: know_more_tokens = {TOKENS_TO_GRANT}, "
          f"know_more_view_expires_at = {expires_at.isoformat()}Z\n")

    for email in EMAILS:
        user = await db.users.find_one(email_query(email))
        if not user:
            not_found.append(email)
            print(f"[NOT FOUND] {email}")
            continue

        matched += 1
        current = user.get("know_more_tokens", 0)

        if dry_run:
            print(f"[would update] {email} (stored: {user.get('email')}) "
                  f"tokens {current} -> {TOKENS_TO_GRANT}")
            continue

        res = await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "know_more_tokens": TOKENS_TO_GRANT,
                "know_more_view_expires_at": expires_at,
                "know_more_access": True,  # keep legacy flag in sync with credit_payment()
            }},
        )
        modified += res.modified_count
        print(f"[updated] {email} (stored: {user.get('email')}) "
              f"tokens {current} -> {TOKENS_TO_GRANT}")

    print("\n=== Summary ===")
    print(f"matched:   {matched}/{len(EMAILS)}")
    if not dry_run:
        print(f"modified:  {modified}")
    if not_found:
        print(f"NOT FOUND ({len(not_found)}): {', '.join(not_found)}")

    client.close()


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv))
