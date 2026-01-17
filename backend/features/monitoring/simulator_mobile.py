import time, random, requests, json, os, sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")
API_URL = "http://localhost:8000/api/update_reading"
from features.mobile_notifications.service import send_critical_notification

notified = set()

def run_mobile_simulation():
    with open(STATIONS_FILE, 'r') as f: stations = json.load(f)
    print("📱 MOBILE SIMULATOR: Dashboard + FCM Kicks active...")
    while True:
        for s in stations:
            level = round(s['base_level_mbgl'] + random.uniform(-1, 1), 2)
            status = "Critical" if level > 30 else ("Semi-Critical" if level > 20 else "Safe")
            
            if status == "Critical" and s['id'] not in notified:
                send_critical_notification(s['name'], level)
                notified.add(s['id'])
            elif status != "Critical":
                notified.discard(s['id'])
                
            requests.post(API_URL, json={"station_id": s['id'], "water_level": level, "timestamp": time.strftime("%H:%M:%S"), "status": status})
        time.sleep(10)