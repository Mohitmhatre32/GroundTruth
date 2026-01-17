def calculate_economic_impact(water_saved_mcm):
    """
    Translates water volume into economic value.
    Assumptions:
    - Average cost of commercial/tanker water in India: ₹150 per 1,000 Liters.
    - 1 MCM = 1,000,000,000 Liters.
    - Cost per 1 MCM = ₹15 Crores.
    """
    
    # 1. Cost per Million Cubic Meter (MCM) in INR
    # Calculation: (1,000,000,000 / 1000) * 150 = 150,000,000 (15 Crores)
    COST_PER_MCM_INR = 150000000 
    
    total_value = water_saved_mcm * COST_PER_MCM_INR
    
    # Convert to human-readable Lakhs or Crores
    if total_value >= 10000000:
        value_readable = f"₹{round(total_value / 10000000, 2)} Crores"
    else:
        value_readable = f"₹{round(total_value / 100000, 2)} Lakhs"
        
    return {
        "water_saved_mcm": water_saved_mcm,
        "financial_savings_raw": total_value,
        "financial_savings_text": value_readable,
        "note": "Based on average replacement cost via water tankers (₹150/KL)."
    }