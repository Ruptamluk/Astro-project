import sys

PLANETS = {
    1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu', 5: 'Mercury',
    6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars'
}

def calculate_mahadasha_antardasha(dob_str: str, driver_number: int, current_date=None) -> dict:
    import datetime
    
    # 1) Parse DOB
    y_dob, m_dob, d_dob = map(int, dob_str.split('-'))
    if current_date is None:
        current_date_obj = datetime.datetime.now()
        current_y, current_m, current_d = current_date_obj.year, current_date_obj.month, current_date_obj.day
    else:
        current_y, current_m, current_d = current_date.year, current_date.month, current_date.day
    
    # helper for absolute conversion
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
    
    # Identify how many years passed to start the current 45-year cycle appropriately.
    # We could just loop. 45 years = 16200 days.
    
    # Cycle of Mahadashas starts with the driver number
    cycle_order = [((driver_number - 1 + i) % 9) + 1 for i in range(9)]
    
    current_abs = abs_dob
    
    # Let's fast forward 45 year cycles if needed
    while abs_now >= current_abs + 16200:
        current_abs += 16200

    # Find Mahadasha
    for m in cycle_order:
        mah_days = m * 360  # M years
        new_abs = current_abs + mah_days
        
        if current_abs <= abs_now < new_abs:
            # We are inside this Mahadasha
            maha_num = m
            maha_start_abs = current_abs
            maha_end_abs = new_abs
            
            # Find Antardasha
            antar_cycle = [((m - 1 + i) % 9) + 1 for i in range(9)]
            
            antar_abs = maha_start_abs
            for a in antar_cycle:
                # duration = M * A / 45 years = M * A * 8 days
                antar_days = m * a * 8
                new_antar_abs = antar_abs + antar_days
                if antar_abs <= abs_now < new_antar_abs:
                    return {
                        "current_mahadasha_number": maha_num,
                        "current_mahadasha_planet": PLANETS.get(maha_num, ""),
                        "mahadasha_start": abs_to_date(maha_start_abs),
                        "mahadasha_end": abs_to_date(maha_end_abs),
                        "current_antardasha_number": a,
                        "current_antardasha_planet": PLANETS.get(a, ""),
                        "antardasha_start": abs_to_date(antar_abs),
                        "antardasha_end": abs_to_date(new_antar_abs),
                    }
                antar_abs = new_antar_abs
            break
            
        current_abs = new_abs
        
    return {}

# Test according to image
# DOB: 18-12-1983, testing to see if sequence generated matches
print(calculate_mahadasha_antardasha('1983-12-18', 9, current_date=None))
