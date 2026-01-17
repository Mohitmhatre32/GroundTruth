import time
import random
import math
import requests
import json
import os
import sys

# Setup Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")
API_URL = "http://localhost:8000/api/update_reading"

def load_stations():
    try:
        with open(STATIONS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Error: stations.json not found.")
        sys.exit(1)

def generate_reading(station_id, base_level, hour):
    # Add noise & daily pattern
    noise = random.uniform(-1.0, 1.0)
    pattern = math.sin((hour / 24) * 2 * math.pi) * 0.5
    level = base_level + noise + pattern

    # FORCE specific statuses for demonstration if needed, 
    # or rely on base_level logic:
    # North (35m) -> Critical
    # Central (22m) -> Semi-Critical
    # South (15m) -> Safe
    return round(level, 2)

def main():
    stations = load_stations()
    print(f"🚀 Simulation Running. Pushing Safe 🟢, Semi-Critical 🟡, and Critical 🔴 data.")

    while True:
        current_hour = time.localtime().tm_hour
        
        for station in stations:
            level = generate_reading(station['id'], station['base_level_mbgl'], current_hour)
            
            # 3-TIER CLASSIFICATION LOGIC
            status = "Safe"
            if level > 30:
                status = "Critical"
            elif level > 20:
                status = "Semi-Critical"
            
            payload = {
                "station_id": station['id'],
                "water_level": level,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status
            }
            
            try:
                requests.post(API_URL, json=payload)
                # Visual Log
                icon = "🔴" if status == "Critical" else ("🟡" if status == "Semi-Critical" else "🟢")
                print(f"{icon} {station['name']}: {level}m ({status})")
            except:
                pass

        print("-" * 30)
        time.sleep(10) # Updates every 10 seconds

if __name__ == "__main__":
    main()