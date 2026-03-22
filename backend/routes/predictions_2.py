from fastapi import APIRouter, Depends, HTTPException, Request
from models import DOBSubmitRequest
from utils import (
    get_zodiac_sign, get_zodiac_prediction, 
    calculate_driver_number, calculate_conductor_number, calculate_personal_year,
    calculate_strength_number, get_driver_conductor_analysis, get_gochor
)
from datetime import datetime
from bson import ObjectId

router = APIRouter()

async def get_db(request: Request):
    return request.app.db

@router.post("/submit-dob/{user_id}")
async def submit_dob(user_id: str, request_data: DOBSubmitRequest, db=Depends(get_db)):
    """Submit date of birth and get prediction"""
    
    try:
        # Validate user_id format
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        users_collection = db["users"]
        
        # Verify user exists and is verified
        user = await users_collection.find_one({"_id": user_obj_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has verified email or phone
        email_verified = user.get("email_verified", False)
        phone_verified = user.get("phone_verified", False)
        
        if not (email_verified or phone_verified):
            raise HTTPException(status_code=403, detail="Email or phone must be verified before submitting DOB")
        
        # Parse DOB
        try:
            dob_date = datetime.strptime(request_data.dob, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        # Validate DOB is in the past
        if dob_date > datetime.now():
            raise HTTPException(status_code=400, detail="Date of birth cannot be in the future")
        
        # Calculate zodiac sign
        zodiac_sign = get_zodiac_sign(dob_date.month, dob_date.day)
        
        # Update user with DOB and zodiac sign
        result = await users_collection.update_one(
            {"_id": user_obj_id},
            {
                "$set": {
                    "dob": request_data.dob,
                    "zodiac_sign": zodiac_sign,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get prediction
        prediction_data = get_zodiac_prediction(zodiac_sign)
        
        # Calculate numerology numbers
        driver_number = calculate_driver_number(request_data.dob)
        conductor_number = calculate_conductor_number(request_data.dob)
        personal_year = calculate_personal_year(request_data.dob)
        strength_number = calculate_strength_number(driver_number, conductor_number)
        
        # Get analysis
        analysis = get_driver_conductor_analysis(driver_number, conductor_number)
        gochor = get_gochor(driver_number, conductor_number)
        
        return {
            "success": True,
            "dob": request_data.dob,
            "driver_number": driver_number,
            "conductor_number": conductor_number,
            "strength_number": strength_number,
            "personal_year": personal_year,
            "prediction": prediction_data["prediction"],
            "lucky_color": prediction_data["lucky_color"],
            "lucky_number": prediction_data["lucky_number"],
            "analysis": analysis,
            "gochor": gochor
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[v0] Error in submit_dob: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")

@router.get("/get-prediction/{user_id}")
async def get_prediction(user_id: str, db=Depends(get_db)):
    """Get user's stored prediction"""
    
    try:
        users_collection = db["users"]
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("zodiac_sign"):
            raise HTTPException(status_code=400, detail="User has not submitted their DOB yet")
        
        dob = user.get("dob")
        zodiac_sign = user["zodiac_sign"]
        prediction_data = get_zodiac_prediction(zodiac_sign)
        
        # Calculate numerology numbers
        driver_number = calculate_driver_number(dob)
        conductor_number = calculate_conductor_number(dob)
        personal_year = calculate_personal_year(dob)
        
        return {
            "dob": dob,
            "driver_number": driver_number,
            "conductor_number": conductor_number,
            "personal_year": personal_year,
            "prediction": prediction_data["prediction"],
            "lucky_color": prediction_data["lucky_color"],
            "lucky_number": prediction_data["lucky_number"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
