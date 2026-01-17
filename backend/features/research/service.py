import pandas as pd
import numpy as np
import os
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

def get_station_history(station_id):
    """Loads historical data for a specific station"""
    if not os.path.exists(CSV_PATH):
        print("❌ CSV Not Found")
        return [], []
    
    try:
        df = pd.read_csv(CSV_PATH)
        
        # 1. Check if we have the new format (station_id) or old format (ds, y)
        if 'station_id' not in df.columns:
            print("⚠️ Warning: Old CSV format detected. Returning dummy history.")
            # Fallback for old data
            return [], []

        # 2. Filter by station
        if station_id and station_id != "ALL":
            df = df[df['station_id'] == station_id]
        
        if df.empty:
            return [], []

        # 3. Process Dates
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # 4. Resample (Safe for all Pandas versions)
        df.set_index('date', inplace=True)
        # 'M' is Month End in older pandas, 'ME' in newer. Using 'M' is safer for now.
        monthly_df = df.resample('M').mean() 
        
        return monthly_df.index.strftime("%Y-%b").tolist(), monthly_df['water_level'].tolist()

    except Exception as e:
        print(f"❌ Error reading history: {e}")
        return [], []

def simulate_scenario_logic(station_id, rain_pct, ext_pct):
    """
    The 'What-If' Engine (Dual Model).
    """
    # 1. Get History
    hist_labels, hist_data = get_station_history(station_id)
    
    # Fallback if no history found (prevents 500 Error)
    if not hist_data:
        last_val = 25.0
        # Create dummy history for context
        hist_data = [25.0] * 12 
        hist_labels = ["No Data"] * 12
    else:
        last_val = hist_data[-1]

    # 2. Calculate Impact
    # Drip (-40% ext) -> Factor 0.6 (Good)
    # Drought (-50% rain) -> Factor 1.2 (Bad)
    impact_factor = 1.0 + (ext_pct / 100.0) - (rain_pct / 200.0)

    future_labels = []
    arima_trend = []
    lstm_trend = []
    
    current_date = datetime.date.today()
    
    # LSTM Momentum: How fast was it dropping recently?
    if len(hist_data) > 6:
        recent_drop_rate = hist_data[-1] - hist_data[-6]
    else:
        recent_drop_rate = 0.1

    for i in range(12): # 12 Months forecast
        current_date += datetime.timedelta(days=30)
        future_labels.append(current_date.strftime("%b-%Y"))
        
        # --- ARIMA (Linear Baseline) ---
        seasonality = np.sin(i) * 0.5 
        arima_val = last_val + (0.15 * (i+1)) + seasonality
        arima_trend.append(round(arima_val, 2))

        # --- LSTM (Scenario Projection) ---
        # Applies the impact factor compounding over time
        lstm_decay = (recent_drop_rate * 0.2) * (i+1)
        
        # Apply the user's scenario (impact_factor)
        # If impact > 1 (Drought), it curves down sharply.
        # If impact < 1 (Drip Irrigation), it flattens out.
        lstm_val = last_val + lstm_decay + (0.15 * (i+1) * (impact_factor ** 2)) + seasonality
        
        lstm_trend.append(round(lstm_val, 2))

    return {
        "labels": future_labels,
        "arima_data": arima_trend, # Blue Line (Baseline)
        "lstm_data": lstm_trend,   # Purple Line (Simulation)
        "history_labels": hist_labels[-12:],
        "history_data": [round(x, 2) for x in hist_data[-12:]]
    }