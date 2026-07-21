import sys
sys.path.insert(0, '.')
from utils import (
    calculate_mahadasha_antardasha,
    calculate_dasha_timeline,
    _build_maha_cycle,
    _date_to_abs,
)
from datetime import datetime

failures = []


def check(label, condition):
    print(f"  {'PASS' if condition else 'FAIL'}  {label}")
    if not condition:
        failures.append(label)


def abs_of(date_str):
    return _date_to_abs(*map(int, date_str.split('-')))


print("=== Mahadasha Cycles per Driver ===")
for d in range(1, 10):
    print(f"  driver={d}: {_build_maha_cycle(d)}")

print()

# Test: DOB 18-12-1993, Today 17-04-2026
# Expected: Mahadasha=7 (Ketu), Antardasha=8 (Saturn)
TODAY = datetime(2026, 4, 17)
result = calculate_mahadasha_antardasha("1993-12-18", 9, current_date=TODAY)

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

check("Mahadasha  == 7 (Ketu)", maha_num == 7)
check("Antardasha == 8 (Saturn)", antar_num == 8)
print()


# ── 12-month timeline ────────────────────────────────────────────────────────

def assert_timeline_shape(label, timeline, today_abs, months=12):
    """Invariants every timeline must satisfy, whatever the DOB or driver."""
    check(f"{label}: not empty", len(timeline) > 0)
    if not timeline:
        return

    check(f"{label}: exactly one current period",
          sum(1 for e in timeline if e["is_current"]) == 1)

    # Periods are contiguous: each end is the next start, no gaps or overlaps.
    contiguous = all(
        timeline[i]["end"] == timeline[i + 1]["start"]
        for i in range(len(timeline) - 1)
    )
    check(f"{label}: periods are contiguous", contiguous)

    first, last = timeline[0], timeline[-1]
    check(f"{label}: first period contains today",
          abs_of(first["start"]) <= today_abs < abs_of(first["end"]))
    check(f"{label}: first period is the current one", first["is_current"])
    check(f"{label}: window is covered to the end",
          abs_of(last["end"]) >= today_abs + months * 30)
    # Strict window: nothing may start on or after its end.
    check(f"{label}: no period starts past the window",
          all(abs_of(e["start"]) < today_abs + months * 30 for e in timeline))

    # Antardasha durations inside one Mahadasha must sum to M * 360 days. Only
    # checkable for Mahadashas the window covers end to end.
    for m in {e["mahadasha_number"] for e in timeline}:
        parts = [e for e in timeline if e["mahadasha_number"] == m]
        if len(parts) == 9:
            span = abs_of(parts[-1]["end"]) - abs_of(parts[0]["start"])
            check(f"{label}: Mahadasha {m} Antardashas sum to {m} years", span == m * 360)


print("=== Timeline: DOB 18-12-1993, driver 9, next 12 months ===")
today_abs = abs_of("2026-04-17")
timeline = calculate_dasha_timeline("1993-12-18", 9, current_date=TODAY)
for e in timeline:
    mark = "  <- now" if e["is_current"] else ""
    print(f"  {e['start']} -> {e['end']}  "
          f"M{e['mahadasha_number']} {e['mahadasha_planet']:<8} / "
          f"A{e['antardasha_number']} {e['antardasha_planet']:<8}{mark}")
print()

assert_timeline_shape("driver 9", timeline, today_abs)
current = next((e for e in timeline if e["is_current"]), None)
check("driver 9: current entry matches calculate_mahadasha_antardasha",
      current is not None
      and current["mahadasha_number"] == result["current_mahadasha_number"]
      and current["antardasha_number"] == result["current_antardasha_number"]
      and current["start"] == result["antardasha_start"]
      and current["end"] == result["antardasha_end"])
print()


# Short Mahadasha: driver 1 (Sun) lasts a single year, so a window starting partway
# through it runs out of Sun Antardashas and crosses into the Moon Mahadasha.
print("=== Timeline: driver 1 (Sun, 1-year Mahadasha) ===")
short = calculate_dasha_timeline("2026-01-01", 1, current_date=datetime(2026, 4, 1))
for e in short:
    print(f"  {e['start']} -> {e['end']}  "
          f"M{e['mahadasha_number']} / A{e['antardasha_number']}")
print()
assert_timeline_shape("driver 1", short, abs_of("2026-04-01"))
check("driver 1: window spans more than one Mahadasha",
      len({e["mahadasha_number"] for e in short}) > 1)
check("driver 1: Sun Mahadasha hands over to Moon",
      [e["mahadasha_number"] for e in short] == sorted(e["mahadasha_number"] for e in short)
      and {e["mahadasha_number"] for e in short} == {1, 2})
print()


# Mega-cycle wrap: the nine Mahadashas span 45 astrological years, after which the
# cycle restarts. DOB 1981-01-01 puts that boundary at 2026-01-01, so a window
# opening in mid-2025 straddles it — the walk must continue into the new cycle.
print("=== Timeline: mega-cycle boundary ===")
wrap = calculate_dasha_timeline("1981-01-01", 9, current_date=datetime(2025, 7, 1))
for e in wrap:
    print(f"  {e['start']} -> {e['end']}  "
          f"M{e['mahadasha_number']} / A{e['antardasha_number']}")
print()
assert_timeline_shape("mega-cycle", wrap, abs_of("2025-07-01"))
check("mega-cycle: walk crosses the 45-year boundary",
      any(e["mahadasha_start"] >= "2026-01-01" for e in wrap))
print()


# A DOB the parser cannot read must not raise.
check("unparseable DOB returns []", calculate_dasha_timeline("not-a-date", 9) == [])
print()

if failures:
    print(f"[{len(failures)} CHECK(S) FAILED]")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("[ALL CHECKS PASSED]")
