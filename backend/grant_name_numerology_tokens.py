"""One-off admin script: grant Name Numerology tokens to a fixed set of users.

Only touches `name_numerology_tokens` (separate from Know More tokens).
The same grant is available in the admin portal (Grant access tab).

Usage (from backend/):
    python grant_name_numerology_tokens.py <amount> --dry-run   # report only, no writes
    python grant_name_numerology_tokens.py <amount>             # set balance to <amount>
    python grant_name_numerology_tokens.py <amount> --add       # add <amount> to balance
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


async def main(amount: int, add: bool, dry_run: bool) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    matched = 0
    modified = 0
    not_found = []

    mode = "DRY-RUN (no writes)" if dry_run else "APPLY"
    op = f"+{amount}" if add else f"= {amount}"
    print(f"=== Grant Name Numerology tokens — {mode} ===")
    print(f"Target: name_numerology_tokens {op}\n")

    for email in EMAILS:
        user = await db.users.find_one(email_query(email))
        if not user:
            not_found.append(email)
            print(f"[NOT FOUND] {email}")
            continue

        matched += 1
        current = user.get("name_numerology_tokens", 0)
        target = current + amount if add else amount

        if dry_run:
            print(f"[would update] {email} (stored: {user.get('email')}) "
                  f"tokens {current} -> {target}")
            continue

        update = ({"$inc": {"name_numerology_tokens": amount}} if add
                  else {"$set": {"name_numerology_tokens": amount}})
        res = await db.users.update_one({"_id": user["_id"]}, update)
        modified += res.modified_count
        print(f"[updated] {email} (stored: {user.get('email')}) "
              f"tokens {current} -> {target}")

    print("\n=== Summary ===")
    print(f"matched:   {matched}/{len(EMAILS)}")
    if not dry_run:
        print(f"modified:  {modified}")
    if not_found:
        print(f"NOT FOUND ({len(not_found)}): {', '.join(not_found)}")

    client.close()


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1 or not args[0].isdigit():
        print(__doc__)
        sys.exit(1)
    asyncio.run(main(
        amount=int(args[0]),
        add="--add" in sys.argv,
        dry_run="--dry-run" in sys.argv,
    ))
