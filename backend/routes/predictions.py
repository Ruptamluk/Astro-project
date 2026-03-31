from fastapi import APIRouter, Depends, HTTPException, Request
from models import DOBSubmitRequest
import json
import os
from utils import (
    get_zodiac_sign,
    get_zodiac_prediction,
    calculate_driver_number,
    calculate_conductor_number,
    calculate_personal_year,
    calculate_strength_number,
    build_dob_chart,
)
from datetime import datetime
from bson import ObjectId

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Lucky number JSON
with open(os.path.join(BASE_DIR, "data", "lucky_numbers.json"), encoding="utf-8") as f:
    lucky_number_raw = json.load(f)

LUCKY_NUMBER_MAP = {
    str(item["No."]).strip(): [
        int(x.strip()) for x in str(item["Friends"]).split(",") if x.strip()
    ]
    for item in lucky_number_raw
}

# Lucky color JSON
with open(os.path.join(BASE_DIR, "data", "lucky_color.json"), encoding="utf-8") as f:
    lucky_color_raw = json.load(f)

LUCKY_COLOR_MAP = {
    str(item["Driver number"]).strip(): str(item["lucky color"]).strip()
    for item in lucky_color_raw
}

with open(os.path.join(BASE_DIR, "data", "gochor.json"), encoding="utf-8") as f:
    gochor_raw = json.load(f)

def _pick_first(row: dict, keys: list[str], default=""):
    for key in keys:
        if key in row and str(row[key]).strip() != "":
            return row[key]
    return default

GOCHOR_MAP = {}

for item in gochor_raw:
    gochor_value = _pick_first(
        item,
        ["gochor", "Gochor", "Gochor", "No.", "No", "Number", "number"]
    )

    prediction_value = _pick_first(
        item,
        ["prediction", "Prediction", "analysis", "Analysis"]
    )

    remedy_value = _pick_first(
        item,
        ["remedy", "Remedy", "upay", "Upay"]
    )

    if str(gochor_value).strip() != "":
        GOCHOR_MAP[int(str(gochor_value).strip())] = {
            "prediction": str(prediction_value).strip(),
            "remedy": str(remedy_value).strip()
        }

print("GOCHOR_MAP:", GOCHOR_MAP)

router = APIRouter()


async def get_db(request: Request):
    return request.app.db


def get_lucky_numbers(driver: int, conductor: int):
    """
    Lucky number is the ordered intersection of driver's and conductor's friend lists.
    If multiple values exist, return comma-separated string.
    """
    driver_values = LUCKY_NUMBER_MAP.get(str(driver), [])
    conductor_values = set(LUCKY_NUMBER_MAP.get(str(conductor), []))

    intersection = [num for num in driver_values if num in conductor_values]

    seen = set()
    unique_intersection = []
    for num in intersection:
        if num not in seen:
            seen.add(num)
            unique_intersection.append(num)

    if not unique_intersection:
        return None

    if len(unique_intersection) == 1:
        return unique_intersection[0]

    return ",".join(map(str, unique_intersection))


def get_lucky_color(driver: int):
    """
    Lucky color comes from driver number mapping.
    Returns comma-separated color string from JSON.
    """
    return LUCKY_COLOR_MAP.get(str(driver), "")


def calculate_gochor(dob: str, current_date: datetime | None = None) -> int:
    """
    Running age = current year - birth year

    Rule:
    - remainder = running_age % 9
    - build series from remainder: e.g. 6,7,8,9,1,2,3,4,5
    - gochor is the last element of that series

    Compact form:
    - if remainder == 0 => gochor = 9
    - else gochor = remainder - 1
    - if that becomes 0 => gochor = 9

    Examples:
    1993 with current year 2026 => age 33 => 33 % 9 = 6 => gochor = 5
    age 32 => 32 % 9 = 5 => gochor = 4
    age 27 => 27 % 9 = 0 => gochor = 9
    """
    try:
        if current_date is None:
            current_date = datetime.now()

        birth_year = int(dob.split("-")[0])
        running_age = current_date.year - birth_year
        remainder = running_age % 9

        if remainder == 0:
            return 9

        gochor = remainder - 1
        return 9 if gochor == 0 else gochor

    except Exception:
        return 9


@router.post("/submit-dob/{user_id}")
async def submit_dob(user_id: str, request_data: DOBSubmitRequest, db=Depends(get_db)):
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        users_collection = db["users"]
        driver_conductor_collection = db["driver_conductor_analysis"]
        strength_collection = db["strength_number_analysis"]

        user = await users_collection.find_one({"_id": user_obj_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        email_verified = user.get("email_verified", False)
        phone_verified = user.get("phone_verified", False)

        if not (email_verified or phone_verified):
            raise HTTPException(
                status_code=403,
                detail="Email or phone must be verified before submitting DOB"
            )

        try:
            dob_date = datetime.strptime(request_data.dob, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        if dob_date > datetime.now():
            raise HTTPException(
                status_code=400,
                detail="Date of birth cannot be in the future"
            )

        # Keep zodiac sign if you still use it elsewhere
        zodiac_sign = get_zodiac_sign(dob_date.month, dob_date.day)
        _ = get_zodiac_prediction(zodiac_sign)

        driver_number = calculate_driver_number(request_data.dob)
        conductor_number = calculate_conductor_number(request_data.dob)
        personal_year = calculate_personal_year(request_data.dob)
        strength_number = calculate_strength_number(request_data.dob, driver_number)
        gochor_number = calculate_gochor(request_data.dob)
        dob_chart = build_dob_chart(request_data.dob, driver_number)

        lucky_number = get_lucky_numbers(driver_number, conductor_number)
        lucky_color = get_lucky_color(driver_number)

        analysis_doc = await driver_conductor_collection.find_one({
            "driver_number": driver_number,
            "conductor_number": conductor_number
        })

        analysis = (
            analysis_doc.get("analysis", "No analysis found for this combination.")
            if analysis_doc else
            "No analysis found for this combination."
        )

        strength_doc = await strength_collection.find_one({
            "strength_number": strength_number
        })

        strength_prediction = (
            strength_doc.get("prediction", "No strength number prediction available yet.")
            if strength_doc else
            "No strength number prediction available yet."
        )

        strength_remedy = (
            strength_doc.get("remedy", "No remedy available yet.")
            if strength_doc else
            "No remedy available yet."
        )

        # Placeholder values until you add separate data sources
        gochor_data = GOCHOR_MAP.get(gochor_number, {})

        gochor_prediction = gochor_data.get(
            "prediction",
            "No gochor prediction available yet."
        )

        gochor_remedy = gochor_data.get(
            "remedy",
            "No gochor remedy available yet."
        )
        mahadasha_prediction = ""
        mahadasha_remedy = ""
        antardasha_prediction = ""
        antardasha_remedy = ""

        await users_collection.update_one(
            {"_id": user_obj_id},
            {
                "$set": {
                    "dob": request_data.dob,
                    "zodiac_sign": zodiac_sign,
                    "driver_number": driver_number,
                    "conductor_number": conductor_number,
                    "personal_year": personal_year,
                    "analysis": analysis,
                    "lucky_color": lucky_color,
                    "lucky_number": lucky_number,
                    "strength_number": strength_number,
                    "strength_prediction": strength_prediction,
                    "strength_remedy": strength_remedy,
                    "gochor_number": gochor_number,
                    "gochor_prediction": gochor_prediction,
                    "gochor_remedy": gochor_remedy,
                    "mahadasha_prediction": mahadasha_prediction,
                    "mahadasha_remedy": mahadasha_remedy,
                    "antardasha_prediction": antardasha_prediction,
                    "antardasha_remedy": antardasha_remedy,
                    "dob_chart": dob_chart,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return {
            "success": True,
            "dob": request_data.dob,
            "driver_number": driver_number,
            "conductor_number": conductor_number,
            "personal_year": personal_year,
            "analysis": analysis,
            "lucky_color": lucky_color,
            "lucky_number": lucky_number,
            "strength_number": strength_number,
            "strength_prediction": strength_prediction,
            "strength_remedy": strength_remedy,
            "gochor_number": gochor_number,
            "gochor_prediction": gochor_prediction,
            "gochor_remedy": gochor_remedy,
            "mahadasha_prediction": mahadasha_prediction,
            "mahadasha_remedy": mahadasha_remedy,
            "antardasha_prediction": antardasha_prediction,
            "antardasha_remedy": antardasha_remedy,
            "dob_chart": dob_chart
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in submit_dob: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request"
        )


@router.get("/get-prediction/{user_id}")
async def get_prediction(user_id: str, db=Depends(get_db)):
    try:
        users_collection = db["users"]

        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        user = await users_collection.find_one({"_id": user_obj_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.get("dob"):
            raise HTTPException(
                status_code=400,
                detail="User has not submitted DOB yet"
            )

        dob_chart = user.get("dob_chart") or build_dob_chart(user.get("dob"), user.get("driver_number") or 0)

        return {
            "dob": user.get("dob"),
            "driver_number": user.get("driver_number"),
            "conductor_number": user.get("conductor_number"),
            "personal_year": user.get("personal_year"),
            "analysis": user.get("analysis", "No analysis found."),
            "lucky_color": user.get("lucky_color", ""),
            "lucky_number": user.get("lucky_number"),
            "strength_number": user.get("strength_number"),
            "strength_prediction": user.get(
                "strength_prediction",
                "No strength number prediction available yet."
            ),
            "strength_remedy": user.get(
                "strength_remedy",
                "No remedy available yet."
            ),
            "gochor_number": user.get("gochor_number"),
            "gochor_prediction": user.get("gochor_prediction", ""),
            "gochor_remedy": user.get("gochor_remedy", ""),
            "mahadasha_prediction": user.get("mahadasha_prediction", ""),
            "mahadasha_remedy": user.get("mahadasha_remedy", ""),
            "antardasha_prediction": user.get("antardasha_prediction", ""),
            "antardasha_remedy": user.get("antardasha_remedy", ""),
            "dob_chart": dob_chart
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
