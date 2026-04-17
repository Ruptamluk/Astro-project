"""
Seed script: inserts the mahadasha_antardasha collection into MongoDB.
Run once:  python seed_mahadasha.py

Collection name : mahadasha_antardasha
Planet mapping  : 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu, 5=Mercury,
                  6=Venus, 7=Ketu, 8=Saturn, 9=Mars
Dasha system    : Vimsottari (120-year cycle), total = 120 years
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

PLANET_NAMES = {
    1: "Sun",
    2: "Moon",
    3: "Jupiter",
    4: "Rahu",
    5: "Mercury",
    6: "Venus",
    7: "Ketu",
    8: "Saturn",
    9: "Mars",
}

# Total Mahadasha years for each planet-number (Vimsottari, sums to 120)
MAHADASHA_YEARS = {
    1: 6,   # Sun
    2: 10,  # Moon
    3: 16,  # Jupiter
    4: 18,  # Rahu
    5: 17,  # Mercury
    6: 20,  # Venus
    7: 7,   # Ketu
    8: 19,  # Saturn
    9: 7,   # Mars
}

CYCLE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9]


def _days_to_ymd(total_days: int) -> tuple[int, int, int]:
    y = total_days // 365
    rem = total_days % 365
    m = rem // 30
    d = rem % 30
    return int(y), int(m), int(d)


async def seed():
    mongodb_url = os.getenv(
        "MONGODB_URL", "mongodb://localhost:27017"
    )
    client = AsyncIOMotorClient(mongodb_url)
    db = client["astrology"]
    collection = db["mahadasha_antardasha"]

    await collection.drop()

    docs = []
    for maha_num in CYCLE_ORDER:
        maha_y = MAHADASHA_YEARS[maha_num]
        maha_days = round(maha_y * 365.25)

        # Antardasha starts from the same lord and cycles through CYCLE_ORDER
        a_start = CYCLE_ORDER.index(maha_num)
        antar_cycle = CYCLE_ORDER[a_start:] + CYCLE_ORDER[:a_start]

        antardashas = []
        for antar_num in antar_cycle:
            antar_y = MAHADASHA_YEARS[antar_num]
            fraction = maha_y * antar_y / 120.0
            total_days = round(fraction * 365.25)
            y, m, d = _days_to_ymd(total_days)
            antardashas.append(
                {
                    "antardasha_number": antar_num,
                    "planet": PLANET_NAMES[antar_num],
                    "years": y,
                    "months": m,
                    "days": d,
                    "total_days": total_days,
                }
            )

        docs.append(
            {
                "mahadasha_number": maha_num,
                "planet": PLANET_NAMES[maha_num],
                "years": maha_y,
                "months": 0,
                "days": 0,
                "total_days": maha_days,
                "antardashas": antardashas,
            }
        )

    await collection.insert_many(docs)
    print(f"[OK] Seeded {len(docs)} mahadasha documents into 'mahadasha_antardasha'")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
