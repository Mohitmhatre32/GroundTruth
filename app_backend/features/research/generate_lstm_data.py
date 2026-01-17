import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

# Path Setup to ensure files land in 'backend' root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv") # Renamed for consistency with existing code
JSON_PATH = os.path.join(BASE_DIR, "stations.json")

def generate_final_dataset():
    # 1. YOUR MASTER STATION LIST (20 STATIONS)
    stations_data = [
        {"id": "PB-LUD-N", "name": "Ludhiana North - Agri Belt", "lat": 30.9010, "lng": 75.8573, "base_level_mbgl": 35.5, "status_hint": "Critical", "area_sq_km": 450, "infiltration_factor": 0.15},
        {"id": "PB-LUD-S", "name": "Ludhiana South - Textile Zone", "lat": 30.8600, "lng": 75.8100, "base_level_mbgl": 42.1, "status_hint": "Critical", "area_sq_km": 300, "infiltration_factor": 0.08},
        {"id": "PB-AMR-01", "name": "Amritsar Rural Zone", "lat": 31.6340, "lng": 74.8723, "base_level_mbgl": 24.2, "status_hint": "Critical", "area_sq_km": 500, "infiltration_factor": 0.20},
        {"id": "PB-PAT-02", "name": "Patiala Model Town", "lat": 30.3398, "lng": 76.3869, "base_level_mbgl": 28.8, "status_hint": "Critical", "area_sq_km": 250, "infiltration_factor": 0.12},
        {"id": "DL-OKH-01", "name": "Okhla Ind. Area Ph-III", "lat": 28.5300, "lng": 77.2700, "base_level_mbgl": 55.0, "status_hint": "Over-Exploited", "area_sq_km": 100, "infiltration_factor": 0.05},
        {"id": "DL-DWK-02", "name": "Dwarka Sector 21", "lat": 28.5600, "lng": 77.0500, "base_level_mbgl": 18.5, "status_hint": "Semi-Critical", "area_sq_km": 120, "infiltration_factor": 0.10},
        {"id": "DL-YAM-03", "name": "Yamuna Flood Plains", "lat": 28.6100, "lng": 77.2800, "base_level_mbgl": 4.5, "status_hint": "Safe", "area_sq_km": 80, "infiltration_factor": 0.30},
        {"id": "DL-CP-04", "name": "Connaught Place Central", "lat": 28.6315, "lng": 77.2167, "base_level_mbgl": 14.2, "status_hint": "Semi-Critical", "area_sq_km": 50, "infiltration_factor": 0.02},
        {"id": "RJ-JAI-01", "name": "Jaipur Amer Zone", "lat": 26.9124, "lng": 75.7873, "base_level_mbgl": 48.2, "status_hint": "Critical", "area_sq_km": 400, "infiltration_factor": 0.10},
        {"id": "RJ-JOD-02", "name": "Jodhpur Arid Belt", "lat": 26.2389, "lng": 73.0243, "base_level_mbgl": 62.1, "status_hint": "Over-Exploited", "area_sq_km": 600, "infiltration_factor": 0.05},
        {"id": "HR-GUR-01", "name": "Gurgaon Cyber City", "lat": 28.4595, "lng": 77.0266, "base_level_mbgl": 32.8, "status_hint": "Critical", "area_sq_km": 200, "infiltration_factor": 0.05},
        {"id": "HR-FAR-02", "name": "Faridabad NIT", "lat": 28.4089, "lng": 77.3178, "base_level_mbgl": 19.5, "status_hint": "Semi-Critical", "area_sq_km": 180, "infiltration_factor": 0.15},
        {"id": "MH-PUN-01", "name": "Pune Hinjewadi IT Park", "lat": 18.5913, "lng": 73.7389, "base_level_mbgl": 12.5, "status_hint": "Semi-Critical", "area_sq_km": 150, "infiltration_factor": 0.18},
        {"id": "MH-LAT-02", "name": "Latur Agricultural Zone", "lat": 18.4088, "lng": 76.5604, "base_level_mbgl": 28.4, "status_hint": "Critical", "area_sq_km": 500, "infiltration_factor": 0.12},
        {"id": "KA-BLR-01", "name": "Bangalore Electronic City", "lat": 12.8452, "lng": 77.6602, "base_level_mbgl": 21.5, "status_hint": "Critical", "area_sq_km": 200, "infiltration_factor": 0.10},
        {"id": "KA-MYS-02", "name": "Mysore Palace Area", "lat": 12.2958, "lng": 76.6394, "base_level_mbgl": 8.2, "status_hint": "Safe", "area_sq_km": 150, "infiltration_factor": 0.25},
        {"id": "TN-CHE-01", "name": "Chennai Velachery", "lat": 12.9801, "lng": 80.2184, "base_level_mbgl": 5.5, "status_hint": "Safe", "area_sq_km": 100, "infiltration_factor": 0.20},
        {"id": "WB-KOL-01", "name": "Kolkata Salt Lake", "lat": 22.5726, "lng": 88.4125, "base_level_mbgl": 9.2, "status_hint": "Safe", "area_sq_km": 120, "infiltration_factor": 0.15},
        {"id": "GJ-AHM-01", "name": "Ahmedabad SG Highway", "lat": 23.0225, "lng": 72.5714, "base_level_mbgl": 20.9, "status_hint": "Critical", "area_sq_km": 220, "infiltration_factor": 0.10},
        {"id": "TS-HYD-01", "name": "Hyderabad Hitech City", "lat": 17.4435, "lng": 78.3772, "base_level_mbgl": 16.4, "status_hint": "Semi-Critical", "area_sq_km": 180, "infiltration_factor": 0.12}
    ]

    output_file = CSV_PATH
    date_range = pd.date_range(start='2019-01-01', end='2024-01-01', freq='D')
    days = len(date_range)
    all_data = []

    print(f"⏳ Generating daily groundwater patterns for {len(stations_data)} stations...")

    for stn in stations_data:
        if stn['status_hint'] == "Over-Exploited": annual_drop = 1.2
        elif stn['status_hint'] == "Critical": annual_drop = 0.8
        elif stn['status_hint'] == "Semi-Critical": annual_drop = 0.4
        else: annual_drop = 0.05 

        # Trend & Seasonality
        total_trend = np.linspace(0, annual_drop * 5, days)
        day_indices = np.arange(days)
        seasonality = 3.0 * np.sin((2 * np.pi * (day_indices - 100)) / 365.25)

        # Monsoon Recharge
        recharge_effect = np.zeros(days)
        for i in range(days):
            month = date_range[i].month
            if month in [7, 8, 9]: 
                if np.random.rand() > 0.75:
                    recharge_amount = np.random.uniform(0.4, 1.2)
                    for d in range(7):
                        if i + d < days:
                            recharge_effect[i+d] -= recharge_amount * (0.8**d)

        noise = np.random.normal(0, 0.08, days)
        water_level = stn['base_level_mbgl'] + total_trend + seasonality + recharge_effect + noise

        df_temp = pd.DataFrame({
            'date': date_range,
            'station_id': stn['id'],
            'water_level': np.round(water_level, 3)
        })
        all_data.append(df_temp)

    final_df = pd.concat(all_data)
    final_df.to_csv(output_file, index=False)
    
    with open(JSON_PATH, 'w') as f:
        json.dump(stations_data, f, indent=4)

    print(f"✅ DONE! Files saved to backend/")

if __name__ == "__main__":
    generate_final_dataset()