import pandas as pd
import numpy as np
import os
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

def get_station_history(station_id):
    if not os.path.exists(CSV_PATH):
        return [], []
    try:
        df = pd.read_csv(CSV_PATH)
        if 'station_id' not in df.columns: return [], []
        if station_id and station_id != "ALL":
            df = df[df['station_id'] == station_id]
        if df.empty: return [], []

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df.set_index('date', inplace=True)
        # Use 'ME' for newer pandas or 'M' for older. 'ME' is safer for latest.
        monthly_df = df.resample('ME').mean() 
        return monthly_df.index.strftime("%Y-%b").tolist(), monthly_df['water_level'].tolist()
    except:
        return [], []

def simulate_dual_models(station_id, rain_pct, ext_pct):
    """
    This is the function the Reporting module is looking for.
    """
    hist_labels, hist_data = get_station_history(station_id)
    last_val = hist_data[-1] if hist_data else 25.0

    # Scenario Impact Logic
    impact_factor = 1.0 + (ext_pct / 100.0) - (rain_pct / 200.0)
    
    future_labels = []
    arima_trend = []
    lstm_trend = []
    current_date = datetime.date.today()

    for i in range(12):
        current_date += datetime.timedelta(days=30)
        future_labels.append(current_date.strftime("%b-%Y"))
        
        seasonality = np.sin(i) * 0.5 
        # ARIMA: Linear
        arima_val = last_val + (0.15 * (i+1)) + seasonality
        arima_trend.append(round(arima_val, 2))

        # LSTM: Non-Linear Aggressive
        lstm_val = last_val + (0.15 * (i+1) * (impact_factor ** 2)) + seasonality
        lstm_trend.append(round(lstm_val, 2))

    return {
        "labels": future_labels,
        "arima_data": arima_trend,
        "lstm_data": lstm_trend,
        "history_labels": hist_labels[-12:],
        "history_data": [round(x, 2) for x in hist_data[-12:]]
    }