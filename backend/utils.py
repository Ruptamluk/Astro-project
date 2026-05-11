import random
import smtplib
import string
from datetime import datetime, timedelta, date as dt_date
import os
from typing import Optional
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

DOB_CHART_LAYOUT = [
    ["3", "1", "9"],
    ["6", "7", "5"],
    ["2", "8", "4"],
]

def reduce_to_single_digit(num: int) -> int:
    """Reduce a number to single digit by adding its digits"""
    while num >= 10:
        num = sum(int(digit) for digit in str(num))
    return num

def calculate_driver_number(dob: str) -> int:
    """Calculate driver number from date of birth (YYYY-MM-DD format)"""
    try:
        parts = dob.split('-')
        day = int(parts[2])
        return reduce_to_single_digit(day)
    except:
        return 1

def calculate_conductor_number(dob: str) -> int:
    """Calculate conductor number (Life Path) from entire birth date"""
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
    try:
        current_year = datetime.now().year
        parts = dob.split('-')
        month = int(parts[1])
        day = int(parts[2])
        
        personal_year = day + month + current_year
        return reduce_to_single_digit(personal_year)
    except:
        return 1

def calculate_strength_number(dob: str, driver_number: int) -> int:
    """Calculate strength number from driver number and birth month"""
    try:
        parts = dob.split('-')
        month = parts[1]
        month_digit_sum = sum(int(digit) for digit in month)
        return reduce_to_single_digit(driver_number + month_digit_sum)
    except:
        return 1

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

async def send_otp_via_email(email: str, otp: str) -> bool:
    """Send OTP via email using async aiosmtplib (non-blocking)"""
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

        body = f"Your OTP is: {otp}\nIt will expire in 10 minutes."
        msg.attach(MIMEText(body, "plain"))

        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            start_tls=True,
            username=sender_email,
            password=sender_password,
            timeout=30,
        )

        print(f"OTP sent to email: {email} via SMTP")
        return True

    except Exception as e:
        print(f"Email Error: {e}")
        print(f"[Fallback OTP for {email}]: {otp}")
        return False

async def send_otp_via_sms(phone: str, otp: str) -> bool:
    """Stub — SMS not used; OTP is verified via email."""
    return True

def build_dob_chart(
    dob: str,
    driver_number: int,
    conductor_number: int,
) -> list[list[str]]:
    digits = [ch for ch in dob if ch.isdigit() and ch != "0"]

    try:
        if "/" in dob:
            day = int(dob.split("/")[0])
        else:
            day = int(dob.split("-")[2])
    except Exception:
        day = None

    counts = {}
    for digit in digits:
        counts[digit] = counts.get(digit, 0) + 1

    if day is not None and day >= 10 and 1 <= driver_number <= 9:
        counts[str(driver_number)] = counts.get(str(driver_number), 0) + 1

    if 1 <= conductor_number <= 9:
        counts[str(conductor_number)] = counts.get(str(conductor_number), 0) + 1

    return [
        [num * counts.get(num, 0) for num in row]
        for row in DOB_CHART_LAYOUT
    ]

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


# ─────────────────────────────────────────────────────────────────────────────
# Mahadasha / Antardasha  (Vimsottari system mapped to numerology numbers)
# 1=Sun 2=Moon 3=Jupiter 4=Rahu 5=Mercury 6=Venus 7=Ketu 8=Saturn 9=Mars
# Total cycle = 120 years
# ─────────────────────────────────────────────────────────────────────────────

PLANET_NAMES: dict[int, str] = {
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

# Total years for each Mahadasha lord (sums to 120)
MAHADASHA_YEARS: dict[int, int] = {
    1: 6,    # Sun
    2: 10,   # Moon
    3: 16,   # Jupiter
    4: 18,   # Rahu
    5: 17,   # Mercury
    6: 20,   # Venus
    7: 7,    # Ketu
    8: 19,   # Saturn
    9: 7,    # Mars
}

CYCLE_ORDER: list[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

def calculate_mahadasha_antardasha(dob_str: str, driver_number: int, current_date=None) -> dict:
    """
    Calculate the current Mahadasha and Antardasha using the exact proprietary numerology calendar system:
    - Cycle order starts with Driver number and ascends cyclically.
    - Mahadasha `M` always lasts `M` astrological years.
    - Inside Mahadasha `M`, Antardashas follow cyclical sequence starting from `M`.
    - Antardasha `A` inside Mahadasha `M` lasts `M * A / 45` years (`M * A * 8` days).
    - Calculations rely on exactly 360 days per year and 30 days per month arithmetic.
    """
    import datetime

    # Parse DOB
    try:
        y_dob, m_dob, d_dob = map(int, dob_str.split('-'))
    except ValueError:
        return {}
        
    if current_date is None:
        current_date_obj = datetime.datetime.now()
        current_y, current_m, current_d = current_date_obj.year, current_date_obj.month, current_date_obj.day
    else:
        current_y, current_m, current_d = current_date.year, current_date.month, current_date.day

    # Helpers for absolute 360-day astrological calendar conversion
    def date_to_abs(Y, M, D):
        return Y * 360 + (M - 1) * 30 + (D - 1)
        
    def abs_to_date(absolute_days):
        Y = absolute_days // 360
        rem = absolute_days % 360
        M = (rem // 30) + 1
        D = (rem % 30) + 1
        return f"{Y:04d}-{M:02d}-{D:02d}"

    abs_dob = date_to_abs(y_dob, m_dob, d_dob)
    abs_now = date_to_abs(current_y, current_m, current_d)

    # Cycle of Mahadashas starts with the driver number
    cycle_order = [((driver_number - 1 + i) % 9) + 1 for i in range(9)]
    
    current_abs = abs_dob
    
    # 45 Astrological years = 16200 days per full mega-cycle
    # Fast forward into the current 45-year block
    while abs_now >= current_abs + 16200:
        current_abs += 16200

    planets = {
        1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
        6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars"
    }

    # Determine Mahadasha
    for m in cycle_order:
        mah_days = m * 360  # M years duration
        new_abs = current_abs + mah_days
        
        if current_abs <= abs_now < new_abs:
            maha_num = m
            maha_start_abs = current_abs
            maha_end_abs = new_abs
            
            # Determine Antardasha
            antar_cycle = [((m - 1 + i) % 9) + 1 for i in range(9)]
            
            antar_abs = maha_start_abs
            for a in antar_cycle:
                # Duration of Antardasha = M * A * 8 days
                antar_days = m * a * 8
                new_antar_abs = antar_abs + antar_days
                if antar_abs <= abs_now < new_antar_abs:
                    return {
                        "current_mahadasha_number": maha_num,
                        "current_mahadasha_planet": planets.get(maha_num, ""),
                        "mahadasha_start": abs_to_date(maha_start_abs),
                        "mahadasha_end": abs_to_date(maha_end_abs),
                        "current_antardasha_number": a,
                        "current_antardasha_planet": planets.get(a, ""),
                        "antardasha_start": abs_to_date(antar_abs),
                        "antardasha_end": abs_to_date(new_antar_abs),
                    }
                antar_abs = new_antar_abs
            break
            
        current_abs = new_abs
        
    # Beyond all cycles — return a best-effort fallback
    return {
        "current_mahadasha_number": driver_number,
        "current_mahadasha_planet": planets.get(driver_number, ""),
        "current_antardasha_number": driver_number,
        "current_antardasha_planet": planets.get(driver_number, ""),
        "mahadasha_start": dob_str,
        "mahadasha_end": dob_str,
        "antardasha_start": dob_str,
        "antardasha_end": dob_str,
    }
