"""One-off admin script: give a fixed set of users unlimited Name Numerology access.

Sets `name_numerology_unlimited = True` — the name analysis link then always
opens for these users and never spends a Name Numerology token.

Usage (from backend/):
    python grant_name_numerology_unlimited.py --dry-run   # report only, no writes
    python grant_name_numerology_unlimited.py             # apply
    python grant_name_numerology_unlimited.py --revoke    # set it back to False
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
    "Sshreepati999@gmail.com",
    "Sshreepati99@gmail.com",
    "adutta.information@gmail.com",
    "Avishek.dutta2022@gmail.com",
    "r.rupayankolkata@gmail.com",
]


def email_query(email: str) -> dict:
    # Case-insensitive exact match: registration stores email as-given.
    return {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}


async def main(dry_run: bool, value: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    print(f"=== Name Numerology unlimited = {value} — {mode} ===\n")

    not_found = []
    for email in EMAILS:
        users = await db.users.find(email_query(email)).to_list(length=None)
        if not users:
            not_found.append(email)
            print(f"[NOT FOUND] {email}")
            continue
        for user in users:
            current = user.get("name_numerology_unlimited", False)
            if dry_run:
                print(f"[would update] {user.get('email')} ({user['_id']}) {current} -> {value}")
                continue
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"name_numerology_unlimited": value}},
            )
            print(f"[updated] {user.get('email')} ({user['_id']}) {current} -> {value}")

    if not_found:
        print(f"\nNOT FOUND ({len(not_found)}): {', '.join(not_found)}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv, value="--revoke" not in sys.argv))
