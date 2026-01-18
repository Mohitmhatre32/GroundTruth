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
        print(f"❌ Error: stations.json not found at {STATIONS_FILE}")
        sys.exit(1)

def generate_reading(base_level, hour):
    noise = random.uniform(-2.0, 2.0)
    daily_pattern = math.sin((hour / 24) * 2 * math.pi) * 0.5
    return round(base_level + noise + daily_pattern, 2)

def main():
    print(f"📂 Loading stations from: {STATIONS_FILE}")
    stations = load_stations()
    print(f"🚀 Simulation started. Target URL: {API_URL}")

    while True:
        current_hour = time.localtime().tm_hour
        
        for station in stations:
            level = generate_reading(station['base_level_mbgl'], current_hour)
            
            payload = {
                "station_id": station['id'],
                "water_level": level,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Critical" if level > 20 else "Safe"
            }
            
            try:
                response = requests.post(API_URL, json=payload)
                if response.status_code == 200:
                    print(f"✅ Sent: {station['name']} -> {level}m")
                else:
                    print(f"⚠️ Error {response.status_code}: {response.text}")
            except requests.exceptions.ConnectionError:
                print("❌ Connection Error: Is the Uvicorn server running?")

        print("-" * 30)
        time.sleep(40) # Updates every 10 seconds

if __name__ == "__main__":
    main()