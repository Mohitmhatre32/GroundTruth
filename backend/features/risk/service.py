def calculate_risk_assessment(rainfall_mm, area_sq_km, population, crop_area_sq_km, scenario):
    """
    Calculate comprehensive demand-supply analysis with scenario impacts.
    
    Features:
    1. Demand-Supply Analysis (Bank Account Model)
    2. Scenario Planning (What-If Simulator)
    """
    
    # ============================================================================
    # CONSTANTS
    # ============================================================================
    DOMESTIC_PER_CAPITA = 135  # Liters per day per person
    AGRI_WATER_REQ = 450  # mm per year for crops
    INDUSTRIAL_FACTOR = 0.15  # 15% of domestic demand for industry
    INFILTRATION_RATE = 0.15  # 15% of rainfall recharges groundwater
    EVAPORATION_LOSS = 0.10  # 10% loss due to evaporation
    
    # ============================================================================
    # SCENARIO ADJUSTMENTS (What-If Simulator)
    # ============================================================================
    eff_rain = rainfall_mm
    eff_agri = AGRI_WATER_REQ
    eff_infiltration = INFILTRATION_RATE
    eff_evaporation = EVAPORATION_LOSS
    scenario_impact = ""
    
    scenario_lower = scenario.lower()
    
    if scenario_lower == "drought":
        eff_rain *= 0.6  # 40% less rainfall
        eff_evaporation *= 1.5  # 50% more evaporation
        eff_agri *= 1.2  # Crops need 20% more water
        scenario_impact = "Severe water stress: 40% less rain, 50% more evaporation"
        
    elif scenario_lower == "flood":
        eff_rain *= 1.4  # 40% more rainfall
        eff_infiltration *= 0.8  # But 20% less infiltration (runoff)
        scenario_impact = "Excess rainfall but reduced recharge due to runoff"
        
    elif scenario_lower == "climate_change" or scenario_lower == "climatechange":
        eff_rain *= 0.85  # 15% less rainfall
        eff_evaporation *= 1.3  # 30% more evaporation
        eff_agri *= 1.15  # 15% higher water demand for crops
        scenario_impact = "Rising temperatures: Less rain, higher evaporation"
        
    elif scenario_lower == "over_extraction" or scenario_lower == "overuse":
        eff_agri *= 1.5  # 50% more extraction
        population = int(population * 1.2)  # Simulate 20% population growth
        scenario_impact = "Industrial boom: 50% more extraction + 20% population rise"
    
    else:  # Normal scenario
        scenario_impact = "Normal conditions baseline"
    
    # ============================================================================
    # SUPPLY CALCULATION (Income/Recharge)
    # ============================================================================
    gross_recharge = area_sq_km * eff_rain * eff_infiltration  # mm·km²
    evaporation_loss = gross_recharge * eff_evaporation
    net_recharge_mcm = (gross_recharge - evaporation_loss) / 1000.0  # Convert to MCM
    
    # ============================================================================
    # DEMAND CALCULATION (Expenses/Extraction)
    # ============================================================================
    # 1. Domestic demand
    domestic_liters_per_year = population * DOMESTIC_PER_CAPITA * 365
    domestic_mcm = (domestic_liters_per_year / 1_000_000_000.0) * 1000
    
    # 2. Industrial demand (percentage of domestic)
    industrial_mcm = domestic_mcm * INDUSTRIAL_FACTOR
    
    # 3. Agricultural demand
    agri_mcm = (crop_area_sq_km * eff_agri) / 1000.0
    
    # Total demand
    total_demand_mcm = domestic_mcm + industrial_mcm + agri_mcm
    
    # ============================================================================
    # BALANCE & RISK ANALYSIS (Bank Account Check)
    # ============================================================================
    balance_mcm = net_recharge_mcm - total_demand_mcm
    
    # Risk score calculation (0-100)
    if net_recharge_mcm == 0:
        risk_score = 100
        ratio = float('inf')
    else:
        ratio = total_demand_mcm / net_recharge_mcm
        # Formula: Higher ratio = higher risk
        # ratio < 0.8 = Low risk
        # ratio 0.8-1.2 = Moderate
        # ratio 1.2-1.5 = High
        # ratio > 1.5 = Critical
        risk_score = min(max((ratio - 0.5) * 100, 0), 100)
    
    # Risk label
    if risk_score >= 90:
        label = "Critical Risk"
    elif risk_score >= 70:
        label = "High Risk"
    elif risk_score >= 40:
        label = "Moderate Risk"
    else:
        label = "Low Risk"
    
    # Sustainability status
    if balance_mcm > 0:
        status = "Sustainable"
        status_color = "success"
    elif balance_mcm > -10:
        status = "Warning"
        status_color = "warning"
    else:
        status = "Critical Deficit"
        status_color = "danger"
    
    # ============================================================================
    # FUTURE PROJECTION (5-year outlook)
    # ============================================================================
    years_until_depletion = None
    if balance_mcm < 0:
        # Estimate how long current reserves will last
        # Assuming average groundwater storage of 100 MCM per 100 km²
        estimated_storage = (area_sq_km / 100) * 100
        annual_deficit = abs(balance_mcm)
        if annual_deficit > 0:
            years_until_depletion = max(int(estimated_storage / annual_deficit), 1)
    
    # ============================================================================
    # RETURN COMPREHENSIVE ANALYSIS
    # ============================================================================
    return {
        # Supply breakdown
        "supply_mcm": round(net_recharge_mcm, 2),
        "gross_recharge_mcm": round(gross_recharge / 1000.0, 2),
        "evaporation_loss_mcm": round(evaporation_loss / 1000.0, 2),
        
        # Demand breakdown
        "demand_mcm": round(total_demand_mcm, 2),
        "domestic_demand_mcm": round(domestic_mcm, 2),
        "industrial_demand_mcm": round(industrial_mcm, 2),
        "agricultural_demand_mcm": round(agri_mcm, 2),
        
        # Balance & Risk
        "balance_mcm": round(balance_mcm, 2),
        "demand_supply_ratio": round(ratio, 2) if ratio != float('inf') else 999,
        "risk_score": round(risk_score, 1),
        "risk_label": label,
        "status": status,
        "status_color": status_color,
        
        # Scenario impact
        "scenario": scenario,
        "scenario_impact": scenario_impact,
        
        # Future projection
        "years_until_depletion": years_until_depletion,
        
        # Context
        "population": population,
        "area_sq_km": area_sq_km,
        "rainfall_mm": round(eff_rain, 1),
        "crop_area_sq_km": crop_area_sq_km
    }
