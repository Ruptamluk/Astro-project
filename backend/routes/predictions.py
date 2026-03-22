from fastapi import APIRouter, Depends, HTTPException, Request
from models import DOBSubmitRequest
from utils import (
    get_zodiac_sign,
    get_zodiac_prediction,
    calculate_driver_number,
    calculate_conductor_number,
    calculate_personal_year,
)
from datetime import datetime
from bson import ObjectId

router = APIRouter()


async def get_db(request: Request):
    return request.app.db


def reduce_to_single_digit(num: int) -> int:
    value = num
    while value > 9:
        value = sum(int(digit) for digit in str(value))
    return value


def calculate_strength_number(dob: str, driver_number: int) -> int:
    """
    Strength Number = single digit of:
    driver number + sum of digits of birth month
    Example:
    DOB = 1993-12-18
    driver = 9
    month = 12 => 1+2 = 3
    9 + 3 = 12 => 1+2 = 3
    """
    try:
        parts = dob.split("-")
        month = parts[1] if len(parts) > 1 else "0"
        month_digit_sum = sum(int(digit) for digit in month if digit.isdigit())
        return reduce_to_single_digit(driver_number + month_digit_sum)
    except Exception:
        return 1


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

        zodiac_sign = get_zodiac_sign(dob_date.month, dob_date.day)
        lucky_data = get_zodiac_prediction(zodiac_sign)

        driver_number = calculate_driver_number(request_data.dob)
        conductor_number = calculate_conductor_number(request_data.dob)
        personal_year = calculate_personal_year(request_data.dob)
        strength_number = calculate_strength_number(request_data.dob, driver_number)

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

        gochor_prediction = ""
        gochor_remedy = ""
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
                    "lucky_color": lucky_data["lucky_color"],
                    "lucky_number": lucky_data["lucky_number"],
                    "strength_number": strength_number,
                    "strength_prediction": strength_prediction,
                    "strength_remedy": strength_remedy,
                    "gochor_prediction": gochor_prediction,
                    "gochor_remedy": gochor_remedy,
                    "mahadasha_prediction": mahadasha_prediction,
                    "mahadasha_remedy": mahadasha_remedy,
                    "antardasha_prediction": antardasha_prediction,
                    "antardasha_remedy": antardasha_remedy,
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
            "lucky_color": lucky_data["lucky_color"],
            "lucky_number": lucky_data["lucky_number"],
            "strength_number": strength_number,
            "strength_prediction": strength_prediction,
            "strength_remedy": strength_remedy,
            "gochor_prediction": gochor_prediction,
            "gochor_remedy": gochor_remedy,
            "mahadasha_prediction": mahadasha_prediction,
            "mahadasha_remedy": mahadasha_remedy,
            "antardasha_prediction": antardasha_prediction,
            "antardasha_remedy": antardasha_remedy
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

        return {
            "dob": user.get("dob"),
            "driver_number": user.get("driver_number"),
            "conductor_number": user.get("conductor_number"),
            "personal_year": user.get("personal_year"),
            "analysis": user.get("analysis", "No analysis found."),
            "lucky_color": user.get("lucky_color"),
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
            "gochor_prediction": user.get("gochor_prediction", ""),
            "gochor_remedy": user.get("gochor_remedy", ""),
            "mahadasha_prediction": user.get("mahadasha_prediction", ""),
            "mahadasha_remedy": user.get("mahadasha_remedy", ""),
            "antardasha_prediction": user.get("antardasha_prediction", ""),
            "antardasha_remedy": user.get("antardasha_remedy", "")
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))