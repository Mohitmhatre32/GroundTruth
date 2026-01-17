def calculate_risk_assessment(rainfall_mm, area_sq_km, population, crop_area_sq_km, scenario):
    # Constants
    DOMESTIC_PER_CAPITA = 135 # Liters per day
    AGRI_WATER_REQ = 450 # mm per year
    INFILTRATION_RATE = 0.15 
    
    # Adjust for Scenario
    eff_rain = rainfall_mm
    eff_agri = AGRI_WATER_REQ

    if scenario == "Drought":
        eff_rain *= 0.7
    elif scenario == "ClimateChange":
        eff_rain *= 0.9
        eff_agri *= 1.1
    elif scenario == "Overuse":
        eff_agri *= 1.25

    # Supply (MCM)
    supply_mcm = (area_sq_km * eff_rain * INFILTRATION_RATE) / 1000.0

    # Demand (MCM)
    domestic_mcm = (population * DOMESTIC_PER_CAPITA * 365) / 1000000000.0 * 1000
    agri_mcm = (crop_area_sq_km * eff_agri) / 1000.0
    total_demand = domestic_mcm + agri_mcm

    # Risk Score (0-100)
    if supply_mcm == 0:
        risk_score = 100
    else:
        ratio = total_demand / supply_mcm
        risk_score = min(max((ratio - 0.5) * 100, 0), 100)

    # Label Logic
    label = "Low"
    if risk_score > 90: 
        label = "Critical"
    elif risk_score > 70: 
        label = "High"
    elif risk_score > 40: 
        label = "Moderate"

    return {
        "supply_mcm": round(supply_mcm, 2),
        "demand_mcm": round(total_demand, 2),
        "risk_score": round(risk_score, 1),
        "risk_label": label
    }