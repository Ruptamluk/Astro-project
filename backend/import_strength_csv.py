import os
import csv
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "astrology"
CSV_FILE = r"D:\astro-project\astro-proj\backend\Incentive_Expense_Sheet.xlsx.csv"

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    collection = db["strength_number_analysis"]

    await collection.delete_many({})

    docs = []
    with open(CSV_FILE, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            docs.append({
                "strength_number": int(row["Strength Number"]),
                "prediction": row["Analysis"].strip(),
                "remedy": "No remedy available yet."
            })

    if docs:
        await collection.insert_many(docs)

    print(f"Imported {len(docs)} rows into strength_number_analysis")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())