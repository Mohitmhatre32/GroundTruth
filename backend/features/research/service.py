import pandas as pd
import numpy as np
import os
import datetime

# Load History for Context
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

def generate_arima_forecast(months=12):
    """
    Simulates an ARIMA/SARIMA model output.
    In a real app, this would load a .pkl model file.
    Here, we project the trend forward mathematically.
    """
    # 1. Get last known data point
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
        last_val = df['y'].iloc[-1]
    else:
        last_val = 20.0

    # 2. Generate Future Dates
    future_dates = []
    bau_trend = []
    
    current_date = datetime.date.today()
    
    for i in range(months):
        # Move forward 1 month
        current_date += datetime.timedelta(days=30)
        future_dates.append(current_date.strftime("%Y-%b"))
        
        # BAU Logic: Trend continues to drop slightly + Seasonality
        # Seasonal wave (Sine) + Trend (0.05m drop per month)
        seasonality = np.sin(i) * 0.5 
        trend_drop = 0.05 * i
        
        predicted_level = last_val + trend_drop + seasonality
        bau_trend.append(round(predicted_level, 2))
        
    return future_dates, bau_trend

def simulate_scenario_logic(station_id, rain_pct, ext_pct):
    """
    The 'What-If' Engine.
    Compares BAU (Business as Usual) vs Scenario.
    """
    # 1. Get BAU Forecast (The AI Prediction)
    labels, bau_data = generate_arima_forecast()
    
    # 2. Apply Scenario Logic
    simulated_data = []
    
    # Logic: 
    # If Extraction increases (+), Depth increases (BAD) -> Factor > 1
    # If Rain increases (+), Depth decreases (GOOD) -> Factor < 1
    
    # Formula derived from prompt requirements:
    # 1.0 base + (Extraction Change / 100) - (Rain Change / 200)
    # Example: Drip Irrigation (-40% Ext) -> 1.0 + (-0.4) = 0.6 multiplier (Water level recovers!)
    
    impact_factor = 1 + (ext_pct / 100.0) - (rain_pct / 200.0)
    
    # Apply cumulative impact over time
    for i, val in enumerate(bau_data):
        # The impact compounds month over month
        compounded_factor = 1 + ((impact_factor - 1) * (i+1) * 0.1)
        simulated_val = val * compounded_factor
        simulated_data.append(round(simulated_val, 2))

    return {
        "station_id": station_id,
        "labels": labels,
        "bau_data": bau_data,          # Blue Line
        "simulated_data": simulated_data, # Red/Green Line
        "rain_change": rain_pct,
        "ext_change": ext_pct
    }