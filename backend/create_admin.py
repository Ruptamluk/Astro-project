"""Seed/upsert an admin account for the admin portal.

Usage (from backend/):
    python create_admin.py <email> <name> <password>
    python create_admin.py admin@example.com "Admin One" "s3cret"

Run once per admin to support multiple admins. Passwords are stored as a
PBKDF2-HMAC-SHA256 hash (see routes/admin.py hash_password). Re-running with an
existing email updates that admin's name + password.
"""

import os
import sys
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Reuse the exact hashing + email-match logic the API uses.
from routes.admin import hash_password, email_query

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"


async def main(email: str, name: str, password: str) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    from datetime import datetime
    existing = await db.admins.find_one(email_query(email))
    doc = {
        "email": email.strip(),
        "name": name,
        "password_hash": hash_password(password),
    }
    if existing:
        await db.admins.update_one({"_id": existing["_id"]}, {"$set": doc})
        print(f"[updated] admin {email}")
    else:
        doc["created_at"] = datetime.utcnow()
        await db.admins.insert_one(doc)
        print(f"[created] admin {email}")

    client.close()


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <email> <name> <password>")
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
