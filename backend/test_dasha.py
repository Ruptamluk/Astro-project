import sys
sys.path.insert(0, '.')
from utils import calculate_mahadasha_antardasha, _build_maha_cycle
from datetime import datetime

print("=== Mahadasha Cycles per Driver ===")
for d in range(1, 10):
    print(f"  driver={d}: {_build_maha_cycle(d)}")

print()

# Test: DOB 18-12-1993, Today 17-04-2026
# Expected: Mahadasha=7 (Ketu), Antardasha=8 (Saturn)
result = calculate_mahadasha_antardasha(
    "1993-12-18",
    9,
    current_date=datetime(2026, 4, 17)
)

maha_num  = result.get("current_mahadasha_number")
maha_name = result.get("current_mahadasha_planet")
antar_num = result.get("current_antardasha_number")
antar_name= result.get("current_antardasha_planet")

print("=== Result for DOB 18-12-1993, Today 17-04-2026 ===")
print(f"  Mahadasha  : {maha_num} ({maha_name})")
print(f"  Antardasha : {antar_num} ({antar_name})")
print(f"  Maha  period: {result.get('mahadasha_start')}  to  {result.get('mahadasha_end')}")
print(f"  Antar period: {result.get('antardasha_start')}  to  {result.get('antardasha_end')}")
print()

ok_maha  = maha_num  == 7
ok_antar = antar_num == 8
print(f"  Mahadasha  == 7 (Ketu)   : {'PASS' if ok_maha  else 'FAIL'}")
print(f"  Antardasha == 8 (Saturn) : {'PASS' if ok_antar else 'FAIL'}")
print()
if ok_maha and ok_antar:
    print("[ALL CHECKS PASSED]")
else:
    print("[SOME CHECKS FAILED]")
    sys.exit(1)
