import time, random, requests, json, os, sys

# 👇 FIXED: Changed 'file' to '__file__'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")
API_URL = "http://localhost:8000/api/update_reading"

from features.mobile_notifications.fcm import send_critical_notification

notified_list = set()

def run_mobile_simulation():
    if not os.path.exists(STATIONS_FILE):
        print(f"❌ Error: {STATIONS_FILE} not found")
        return

    with open(STATIONS_FILE, 'r') as f: 
        stations = json.load(f)

    print("\n📱 MOBILE SIMULATOR STARTED")

    while True:
        for s in stations:
            level = round(s['base_level_mbgl'] + random.uniform(-1.5, 1.5), 2)

            if level > 30: status = "Critical"
            elif level > 20: status = "Semi-Critical"
            else: status = "Safe"

            if status == "Critical":
                if s['id'] not in notified_list:
                    # Trigger logic in mobile_notifications/service.py
                    send_critical_notification(s['name'], level)
                    notified_list.add(s['id'])
            else:
                notified_list.discard(s['id'])

            # API Update for Web Dashboard
            try:
                # 👇 ENSURE these 4 fields match your Pydantic model in router.py
                payload = {
                    "station_id": s['id'], 
                    "water_level": level, 
                    "timestamp": time.strftime("%H:%M:%S"), 
                    "status": status
                }
                res = requests.post(API_URL, json=payload, timeout=2)
                if res.status_code != 200:
                    print(f"⚠️ Server returned {res.status_code}: {res.text}")
            except Exception as e:
                print(f"❌ Connection error: {e}")

        time.sleep(10)