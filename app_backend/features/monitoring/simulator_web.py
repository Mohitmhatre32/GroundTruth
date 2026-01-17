import time, random, math, requests, json, os, sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")
API_URL = "http://localhost:8000/api/update_reading"

def run_web_simulation():
    with open(STATIONS_FILE, 'r') as f: stations = json.load(f)
    print("🌐 WEB SIMULATOR: Updating Dashboard only...")
    while True:
        for s in stations:
            level = round(s['base_level_mbgl'] + random.uniform(-1, 1), 2)
            status = "Safe"
            if level > 30: status = "Critical"
            elif level > 20: status = "Semi-Critical"
            requests.post(API_URL, json={"station_id": s['id'], "water_level": level, "timestamp": time.strftime("%H:%M:%S"), "status": status})
        time.sleep(10)