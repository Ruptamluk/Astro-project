import random
import smtplib
import string
from datetime import datetime, timedelta
import os
from typing import Optional
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def reduce_to_single_digit(num: int) -> int:
    """Reduce a number to single digit by adding its digits"""
    while num >= 10:
        num = sum(int(digit) for digit in str(num))
    return num

def calculate_driver_number(dob: str) -> int:
    """Calculate driver number from date of birth (YYYY-MM-DD format)"""
    # Driver number is the reduction of birth day only
    # E.g., 23rd = 2 + 3 = 5
    try:
        parts = dob.split('-')
        day = int(parts[2])
        return reduce_to_single_digit(day)
    except:
        return 1

def calculate_conductor_number(dob: str) -> int:
    """Calculate conductor number (Life Path) from entire birth date"""
    # Conductor number is the reduction of DD + MM + YYYY
    # E.g., 23/05/1993 = 23 + 5 + 1993 = 2021 = 2+0+2+1 = 5
    try:
        parts = dob.split('-')
        day = int(parts[2])
        month = int(parts[1])
        year = int(parts[0])
        
        full_date = day + month + year
        return reduce_to_single_digit(full_date)
    except:
        return 1

def calculate_personal_year(dob: str) -> int:
    """Calculate personal year number based on current date"""
    # Personal year = day + month + current year, reduced to single digit
    # E.g., 23/05 + 2026 = 23 + 5 + 2026 = 2054 = 2+0+5+4 = 11 = 1+1 = 2
    try:
        current_year = datetime.now().year
        parts = dob.split('-')
        month = int(parts[1])
        day = int(parts[2])
        
        personal_year = day + month + current_year
        return reduce_to_single_digit(personal_year)
    except:
        return 1

def calculate_strength_number(driver: int, conductor: int) -> int:
    """Calculate strength number from driver and conductor numbers"""
    # Strength number = Driver + Conductor reduced to single digit
    strength = driver + conductor
    return reduce_to_single_digit(strength)

def get_driver_conductor_analysis(driver: int, conductor: int) -> dict:
    """Get detailed analysis for driver and conductor numbers"""
    driver_meanings = {
        1: {
            "title": "The Leader",
            "personality": "Independent, ambitious, and pioneering. You are a natural leader with determination and confidence.",
            "career": "Entrepreneur, Manager, Executive, Innovator",
            "love": "You seek a partner who respects your independence. Strong, passionate, and decisive in relationships.",
            "strength": "Leadership, courage, innovation",
            "challenge": "Impatience, stubbornness, dominance"
        },
        2: {
            "title": "The Diplomat",
            "personality": "Cooperative, sensitive, and intuitive. You are a peacemaker who values harmony and partnership.",
            "career": "Counselor, Artist, Diplomat, Teacher",
            "love": "You are loyal and devoted. You seek emotional connection and understanding in relationships.",
            "strength": "Diplomacy, sensitivity, intuition",
            "challenge": "Indecision, fear of conflict, dependence"
        },
        3: {
            "title": "The Creator",
            "personality": "Expressive, creative, and optimistic. You bring joy and inspiration to those around you.",
            "career": "Artist, Writer, Performer, Designer, Entertainer",
            "love": "Playful and charming, you attract others easily. You value fun and spontaneity in love.",
            "strength": "Creativity, communication, optimism",
            "challenge": "Scattered energy, lack of focus, superficiality"
        },
        4: {
            "title": "The Builder",
            "personality": "Practical, hardworking, and stable. You are the foundation upon which great things are built.",
            "career": "Engineer, Accountant, Constructor, Administrator",
            "love": "Loyal and dependable, you provide stability. You are committed and reliable in relationships.",
            "strength": "Reliability, stability, work ethic",
            "challenge": "Rigidity, resistance to change, limitation"
        },
        5: {
            "title": "The Adventurer",
            "personality": "Dynamic, versatile, and freedom-loving. You are a natural communicator and adaptable to change.",
            "career": "Salesman, Writer, Journalist, Consultant, Traveler",
            "love": "You crave excitement and variety. You are playful but need a partner who understands your need for freedom.",
            "strength": "Adaptability, communication, versatility",
            "challenge": "Restlessness, scattered focus, irresponsibility"
        },
        6: {
            "title": "The Nurturer",
            "personality": "Responsible, caring, and harmony-loving. You are nurturing and devoted to family and community.",
            "career": "Counselor, Teacher, Nurse, Social Worker, Artist",
            "love": "You are devoted and loving. Family is important to you, and you seek lasting, stable relationships.",
            "strength": "Responsibility, nurturing, harmony",
            "challenge": "Over-responsibility, self-sacrifice, jealousy"
        },
        7: {
            "title": "The Seeker",
            "personality": "Analytical, spiritual, and introspective. You seek truth and deeper understanding of life.",
            "career": "Researcher, Philosopher, Scientist, Spiritual Guide, Analyst",
            "love": "You are introspective and need intellectual connection. You value depth over superficial relationships.",
            "strength": "Analysis, intuition, spirituality",
            "challenge": "Isolation, overthinking, skepticism"
        },
        8: {
            "title": "The Authority",
            "personality": "Ambitious, powerful, and driven. You have the ability to achieve material success and influence.",
            "career": "Executive, Entrepreneur, Manager, Financial Advisor",
            "love": "You seek a partner who respects your ambition. You are passionate and provide security.",
            "strength": "Ambition, power, material success",
            "challenge": "Materialism, power-seeking, ruthlessness"
        },
        9: {
            "title": "The Humanitarian",
            "personality": "Compassionate, idealistic, and universal. You are driven by humanitarian ideals and service.",
            "career": "Humanitarian, Counselor, Artist, Healer, Teacher",
            "love": "You love humanity and are universally compassionate. You seek meaningful, purposeful relationships.",
            "strength": "Compassion, idealism, universal love",
            "challenge": "Over-idealism, emotional burden, distance"
        }
    }
    
    return driver_meanings.get(driver, driver_meanings[1])

def get_gochor(driver: int, conductor: int) -> str:
    """Get Gochor (compatibility indicator) based on numbers"""
    sum_val = driver + conductor
    
    gochors = {
        2: "Mrityu Sankhya (Death Number) - Handle with spiritual approach",
        4: "Papaank (Inauspicious) - Requires caution and planning",
        7: "Sukh Sankhya (Happiness Number) - Favorable and fortunate",
        11: "Master Number - Powerful spiritual potential",
        13: "Karmic Challenge - Learning opportunity",
        16: "Difficult Number - Requires transformation",
    }
    
    return gochors.get(sum_val, f"Number {sum_val} - Balanced influence")

async def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def get_zodiac_sign(month: int, day: int) -> str:
    """Get zodiac sign from month and day"""
    zodiac_signs = [
        ("Capricorn", (12, 22), (1, 19)),
        ("Aquarius", (1, 20), (2, 18)),
        ("Pisces", (2, 19), (3, 20)),
        ("Aries", (3, 21), (4, 19)),
        ("Taurus", (4, 20), (5, 20)),
        ("Gemini", (5, 21), (6, 20)),
        ("Cancer", (6, 21), (7, 22)),
        ("Leo", (7, 23), (8, 22)),
        ("Virgo", (8, 23), (9, 22)),
        ("Libra", (9, 23), (10, 22)),
        ("Scorpio", (10, 23), (11, 21)),
        ("Sagittarius", (11, 22), (12, 21)),
    ]
    
    for sign, (start_month, start_day), (end_month, end_day) in zodiac_signs:
        if (month == start_month and day >= start_day) or (month == end_month and day <= end_day):
            return sign
    return "Unknown"

def send_otp_via_email(email: str, otp: str) -> bool:
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        sender_email = os.getenv("SENDER_EMAIL")
        sender_password = os.getenv("SENDER_PASSWORD")

        if not sender_email or not sender_password:
            print(f"[Demo Mode] OTP for {email}: {otp}")
            return True

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = email
        msg["Subject"] = "Your Astrology App OTP"

        body = f"""
        Your OTP is: {otp}
        It will expire in 10 minutes.
        """

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()   # 🔥 VERY IMPORTANT
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        print(f"OTP sent to email: {email}")
        return True

    except Exception as e:
        print(f"Email Error: {e}")
        print(f"[Fallback OTP] {otp}")
        return False
async def send_otp_via_sms(phone: str, otp: str) -> bool:
    """Send OTP via SMS using Twilio"""
    try:
        from twilio.rest import Client
        
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not account_sid or not auth_token:
            print(f"[Demo Mode] OTP for {phone}: {otp}")
            return True
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your Astrology App OTP is: {otp}. Valid for 10 minutes.",
            from_=twilio_number,
            to=phone
        )
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        print(f"[Demo Mode] OTP for {phone}: {otp}")
        return True
def calculate_strength_number(dob: str, driver_number: int) -> int:
    try:
        parts = dob.split('-')
        month = parts[1]
        month_digit_sum = sum(int(digit) for digit in month)
        return reduce_to_single_digit(driver_number + month_digit_sum)
    except:
        return 1

def get_zodiac_prediction(zodiac_sign: str) -> dict:
    """Get prediction data for a zodiac sign"""
    predictions = {
        "Aries": {
            "prediction": "Your bold and ambitious nature will lead you to new opportunities. Take calculated risks and trust your instincts.",
            "lucky_color": "Red",
            "lucky_number": 7,
            "compatibility": "Compatible with Leo, Sagittarius"
        },
        "Taurus": {
            "prediction": "Stability and patience are your strengths. A period of growth and abundance awaits you.",
            "lucky_color": "Green",
            "lucky_number": 6,
            "compatibility": "Compatible with Virgo, Capricorn"
        },
        "Gemini": {
            "prediction": "Communication and adaptability will be your greatest assets. New connections bring exciting possibilities.",
            "lucky_color": "Yellow",
            "lucky_number": 5,
            "compatibility": "Compatible with Libra, Aquarius"
        },
        "Cancer": {
            "prediction": "Trust your emotional intuition. Family and close relationships will bring you comfort and joy.",
            "lucky_color": "Silver",
            "lucky_number": 2,
            "compatibility": "Compatible with Scorpio, Pisces"
        },
        "Leo": {
            "prediction": "Your confidence and creativity shine brightly. This is your time to step into the spotlight.",
            "lucky_color": "Gold",
            "lucky_number": 1,
            "compatibility": "Compatible with Aries, Sagittarius"
        },
        "Virgo": {
            "prediction": "Your analytical skills will help you solve complex problems. Focus on details and organization.",
            "lucky_color": "Brown",
            "lucky_number": 4,
            "compatibility": "Compatible with Taurus, Capricorn"
        },
        "Libra": {
            "prediction": "Balance and harmony are key. Your diplomatic nature opens doors to meaningful partnerships.",
            "lucky_color": "Blue",
            "lucky_number": 6,
            "compatibility": "Compatible with Gemini, Aquarius"
        },
        "Scorpio": {
            "prediction": "Deep transformation is underway. Your strength and determination will overcome any challenge.",
            "lucky_color": "Maroon",
            "lucky_number": 8,
            "compatibility": "Compatible with Cancer, Pisces"
        },
        "Sagittarius": {
            "prediction": "Adventure and expansion await. Your optimism will inspire others and bring success.",
            "lucky_color": "Purple",
            "lucky_number": 9,
            "compatibility": "Compatible with Aries, Leo"
        },
        "Capricorn": {
            "prediction": "Your discipline and responsibility lead to lasting success. Hard work pays off.",
            "lucky_color": "Black",
            "lucky_number": 3,
            "compatibility": "Compatible with Taurus, Virgo"
        },
        "Aquarius": {
            "prediction": "Innovation and independence define your path. Your unique vision will create change.",
            "lucky_color": "Turquoise",
            "lucky_number": 4,
            "compatibility": "Compatible with Gemini, Libra"
        },
        "Pisces": {
            "prediction": "Your creativity and empathy are your superpowers. Trust the universe's plan for you.",
            "lucky_color": "Sea Green",
            "lucky_number": 7,
            "compatibility": "Compatible with Cancer, Scorpio"
        }
    }
    
    return predictions.get(zodiac_sign, {
        "prediction": "Embrace your unique cosmic energy.",
        "lucky_color": "White",
        "lucky_number": 11,
        "compatibility": "Universal compatibility"
    })
    
