import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_details(station_id):
    if not os.path.exists(STATIONS_FILE):
        return None
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)
        for s in stations:
            if s['id'] == station_id:
                return s
    return None

def calculate_zone_budget(station_id: str, rainfall_mm: float, extraction_modifier: float = 1.0):
    """
    Calculates Water Budget. Handles missing keys gracefully.
    """
    station = get_station_details(station_id)
    if not station:
        raise ValueError("Station not found")

    # 1. Get Area & Infiltration (Use defaults if missing)
    area = station.get('area_sq_km', 250)
    infiltration = station.get('infiltration_factor', 0.15)

    # 2. Calculate Inflow (Recharge)
    total_rain_vol = (rainfall_mm * area) / 1000.0
    recharge_mcm = total_rain_vol * infiltration

    # 3. Calculate Outflow (Extraction)
    # Fix: If 'avg_extraction_mcm' is missing, estimate it based on area
    # (Assuming 0.3 MCM per sq km is a typical extraction rate)
    base_extraction = station.get('avg_extraction_mcm', area * 0.3)
    
    projected_extraction = base_extraction * extraction_modifier

    # 4. Net Balance
    net_balance = recharge_mcm - projected_extraction
    
    # 5. Determine Health
    percent_refilled = (recharge_mcm / projected_extraction) * 100 if projected_extraction > 0 else 100
    
    status = "Sustainable"
    if percent_refilled < 80: status = "Semi-Critical" # Updated to match terminology
    if percent_refilled < 50: status = "Critical"

    return {
        "zone_name": station.get('name', 'Unknown Zone'),
        "area_sq_km": area,
        "estimated_recharge_mcm": round(recharge_mcm, 2),
        "projected_extraction_mcm": round(projected_extraction, 2),
        "net_balance_mcm": round(net_balance, 2),
        "status": status
    }