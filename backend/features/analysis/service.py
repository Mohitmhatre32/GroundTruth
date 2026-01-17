import json
import os

# Load Station Data (Single Source of Truth)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_details(station_id):
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)
        for s in stations:
            if s['id'] == station_id:
                return s
    return None

def calculate_zone_budget(station_id: str, rainfall_mm: float, extraction_modifier: float = 1.0):
    """
    Calculates Water Budget specifically for a Zone.
    extraction_modifier: 1.0 = Normal, 1.2 = 20% increase, 0.8 = 20% ban (Policy Sim)
    """
    station = get_station_details(station_id)
    if not station:
        raise ValueError("Station not found")

    # 1. Calculate Inflow (Recharge)
    # Formula: Area * Rainfall * Infiltration
    total_rain_vol = (rainfall_mm * station['area_sq_km']) / 1000.0
    recharge_mcm = total_rain_vol * station['infiltration_factor']

    # 2. Calculate Outflow (Extraction)
    # Base extraction * User Scenario Modifier
    projected_extraction = station['avg_extraction_mcm'] * extraction_modifier

    # 3. Net Balance
    net_balance = recharge_mcm - projected_extraction
    
    # 4. Determine Health
    percent_refilled = (recharge_mcm / projected_extraction) * 100 if projected_extraction > 0 else 100
    
    status = "Sustainable"
    if percent_refilled < 80: status = "Stressed"
    if percent_refilled < 50: status = "Critical Depletion"

    return {
        "zone_name": station['name'],
        "area_sq_km": station['area_sq_km'],
        "soil_infiltration": f"{station['infiltration_factor']*100}%",
        "rainfall_input_mm": rainfall_mm,
        "estimated_recharge_mcm": round(recharge_mcm, 2),
        "projected_extraction_mcm": round(projected_extraction, 2),
        "net_balance_mcm": round(net_balance, 2),
        "percent_refilled": round(percent_refilled, 1),
        "status": status
    }