import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

def generate_final_dataset():
    # 1. YOUR MASTER STATION LIST (20 STATIONS)
    stations_data = [
        {"id": "PB-LUD-N", "name": "Ludhiana North - Agri Belt", "lat": 30.9010, "lng": 75.8573, "base_level_mbgl": 35.5, "status_hint": "Critical"},
        {"id": "PB-LUD-S", "name": "Ludhiana South - Textile Zone", "lat": 30.8600, "lng": 75.8100, "base_level_mbgl": 42.1, "status_hint": "Critical"},
        {"id": "PB-AMR-01", "name": "Amritsar Rural Zone", "lat": 31.6340, "lng": 74.8723, "base_level_mbgl": 24.2, "status_hint": "Critical"},
        {"id": "PB-PAT-02", "name": "Patiala Model Town", "lat": 30.3398, "lng": 76.3869, "base_level_mbgl": 28.8, "status_hint": "Critical"},
        {"id": "DL-OKH-01", "name": "Okhla Industrial Area Ph-III", "lat": 28.5300, "lng": 77.2700, "base_level_mbgl": 55.0, "status_hint": "Over-Exploited"},
        {"id": "DL-DWK-02", "name": "Dwarka Sector 21", "lat": 28.5600, "lng": 77.0500, "base_level_mbgl": 18.5, "status_hint": "Semi-Critical"},
        {"id": "DL-YAM-03", "name": "Yamuna Flood Plains", "lat": 28.6100, "lng": 77.2800, "base_level_mbgl": 4.5, "status_hint": "Safe"},
        {"id": "DL-CP-04", "name": "Connaught Place Central", "lat": 28.6315, "lng": 77.2167, "base_level_mbgl": 14.2, "status_hint": "Semi-Critical"},
        {"id": "RJ-JAI-01", "name": "Jaipur Amer Zone", "lat": 26.9124, "lng": 75.7873, "base_level_mbgl": 48.2, "status_hint": "Critical"},
        {"id": "RJ-JOD-02", "name": "Jodhpur Arid Belt", "lat": 26.2389, "lng": 73.0243, "base_level_mbgl": 62.1, "status_hint": "Over-Exploited"},
        {"id": "HR-GUR-01", "name": "Gurgaon Cyber City", "lat": 28.4595, "lng": 77.0266, "base_level_mbgl": 32.8, "status_hint": "Critical"},
        {"id": "HR-FAR-02", "name": "Faridabad NIT", "lat": 28.4089, "lng": 77.3178, "base_level_mbgl": 19.5, "status_hint": "Semi-Critical"},
        {"id": "MH-PUN-01", "name": "Pune Hinjewadi IT Park", "lat": 18.5913, "lng": 73.7389, "base_level_mbgl": 12.5, "status_hint": "Semi-Critical"},
        {"id": "MH-LAT-02", "name": "Latur Agricultural Zone", "lat": 18.4088, "lng": 76.5604, "base_level_mbgl": 28.4, "status_hint": "Critical"},
        {"id": "KA-BLR-01", "name": "Bangalore Electronic City", "lat": 12.8452, "lng": 77.6602, "base_level_mbgl": 21.5, "status_hint": "Critical"},
        {"id": "KA-MYS-02", "name": "Mysore Palace Area", "lat": 12.2958, "lng": 76.6394, "base_level_mbgl": 8.2, "status_hint": "Safe"},
        {"id": "TN-CHE-01", "name": "Chennai Velachery", "lat": 12.9801, "lng": 80.2184, "base_level_mbgl": 5.5, "status_hint": "Safe"},
        {"id": "WB-KOL-01", "name": "Kolkata Salt Lake", "lat": 22.5726, "lng": 88.4125, "base_level_mbgl": 9.2, "status_hint": "Safe"},
        {"id": "GJ-AHM-01", "name": "Ahmedabad SG Highway", "lat": 23.0225, "lng": 72.5714, "base_level_mbgl": 20.9, "status_hint": "Critical"},
        {"id": "TS-HYD-01", "name": "Hyderabad Hitech City", "lat": 17.4435, "lng": 78.3772, "base_level_mbgl": 16.4, "status_hint": "Semi-Critical"}
    ]

    # 2. CONFIGURATION
    output_file = "lstm_training_data.csv"
    date_range = pd.date_range(start='2019-01-01', end='2024-01-01', freq='D')
    days = len(date_range)
    all_data = []

    print(f"⏳ Generating daily groundwater patterns for {len(stations_data)} stations...")

    for stn in stations_data:
        # Determine annual depletion rate based on status
        if stn['status_hint'] == "Over-Exploited":
            annual_drop = 1.2
        elif stn['status_hint'] == "Critical":
            annual_drop = 0.8
        elif stn['status_hint'] == "Semi-Critical":
            annual_drop = 0.4
        else:
            annual_drop = 0.05 # Safe/Stable

        # --- A. TREND ---
        total_trend = np.linspace(0, annual_drop * 5, days)

        # --- B. SEASONALITY ---
        # Peak depth (water at lowest) in June, Recharge in Oct
        day_indices = np.arange(days)
        seasonality = 3.0 * np.sin((2 * np.pi * (day_indices - 100)) / 365.25)

        # --- C. MONSOON RECHARGE ---
        recharge_effect = np.zeros(days)
        for i in range(days):
            month = date_range[i].month
            if month in [7, 8, 9]: # July, Aug, Sept
                if np.random.rand() > 0.75: # Heavy rain spikes
                    recharge_amount = np.random.uniform(0.4, 1.2)
                    # Recovery lasts 7 days with decay
                    for d in range(7):
                        if i + d < days:
                            recharge_effect[i+d] -= recharge_amount * (0.8**d)

        # --- D. SENSOR NOISE ---
        noise = np.random.normal(0, 0.08, days)

        # --- COMBINE ---
        water_level = stn['base_level_mbgl'] + total_trend + seasonality + recharge_effect + noise

        # Store in list
        df_temp = pd.DataFrame({
            'date': date_range,
            'station_id': stn['id'],
            'water_level': np.round(water_level, 3)
        })
        all_data.append(df_temp)

    # 3. SAVE TO CSV
    final_df = pd.concat(all_data)
    final_df.to_csv(output_file, index=False)
    
    # 4. ALSO SAVE STATIONS.JSON (to ensure they match perfectly)
    with open('stations.json', 'w') as f:
        json.dump(stations_data, f, indent=4)

    # Combine them
    levels = base_level + trend + seasonality

    # 3. Save to DataFrame
    df = pd.DataFrame({'ds': dates, 'y': levels})
    
    # 4. Export to CSV
    df.to_csv(CSV_PATH, index=False)
    print(f"Dummy Training Data Created at: {CSV_PATH}")

if __name__ == "__main__":
    generate_final_dataset()