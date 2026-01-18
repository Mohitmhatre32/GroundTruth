def calculate_risk_assessment(rainfall_mm, area_sq_km, population, crop_area_sq_km, scenario):
    # 1. Constants
    DOMESTIC_PER_CAPITA = 135 # Liters per day
    AGRI_WATER_REQ = 450      # mm per year (Height of water crops need)
    INFILTRATION_RATE = 0.15  # 15% of rain becomes groundwater
    
    # 2. Adjust for Scenario
    # Drought reduces supply. Climate change increases demand.
    eff_rain = rainfall_mm * (0.6 if scenario == "Drought" else (0.9 if scenario == "ClimateChange" else 1.0))
    eff_agri = AGRI_WATER_REQ * (1.1 if scenario == "ClimateChange" else (1.25 if scenario == "Overuse" else 1.0))

    # 3. Supply Calculation (MCM)
    # Area (km2) * Rain (mm) * Infiltration / 1000 = Million Cubic Meters
    supply_mcm = (area_sq_km * eff_rain * INFILTRATION_RATE) / 1000.0

    # 4. Demand Calculation (MCM)
    # --- FIXED UNIT CONVERSION ---
    # Total Liters = population * 135 * 365
    # 1 MCM = 1,000,000,000 Liters (1 Billion Liters)
    domestic_mcm = (population * DOMESTIC_PER_CAPITA * 365) / 1000000000.0
    
    # Agriculture MCM
    agri_mcm = (crop_area_sq_km * eff_agri) / 1000.0
    
    total_demand = domestic_mcm + agri_mcm

    # 5. STABILIZED RISK SCORE LOGIC
    if supply_mcm <= 0:
        risk_score = 100
    else:
        # Ratio of Demand to Supply
        ratio = total_demand / supply_mcm
        
        # ⚖️ Stabilization Logic:
        # If Ratio is 1.0 (Usage = Recharge), Score is 50 (Balanced)
        # If Ratio is 2.0 (Usage is DOUBLE Recharge), Score is 100 (Crisis)
        # If Ratio is 0.5 (Usage is HALF Recharge), Score is 25 (Safe)
        risk_score = min(max(ratio * 50, 0), 100)

    # 6. Final Classification
    label = "Low Risk"
    if risk_score > 85: label = "Critical Risk"
    elif risk_score > 65: label = "High Risk"
    elif risk_score > 40: label = "Moderate Risk"

    return {
        "supply_mcm": round(supply_mcm, 2),
        "demand_mcm": round(total_demand, 2),
        "domestic_mcm": round(domestic_mcm, 2),
        "agriculture_mcm": round(agri_mcm, 2),
        "risk_score": round(risk_score, 1),
        "risk_label": label
    }