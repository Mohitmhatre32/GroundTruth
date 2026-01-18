import time, random, requests, json, os
from features.mobile_notifications.fcm import send_critical_notification

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")
API_URL = "http://localhost:8000/api/update_reading"

# To prevent spamming the phone every 10 seconds
notified_list = set()

def run_mobile_simulation():
    with open(STATIONS_FILE, 'r') as f: 
        stations = json.load(f)
    
    print("\n📱 MOBILE SIMULATOR STARTED")
    print("Logic: Pushing to Dashboard + Sending Push to Registered Tokens\n")

    while True:
        for s in stations:
            # Simulate level
            level = round(s['base_level_mbgl'] + random.uniform(-1.5, 1.5), 2)
            
            # Classification
            if level > 30: status = "Critical"
            elif level > 20: status = "Semi-Critical"
            else: status = "Safe"

            # Alert Logic
            if status == "Critical":
                if s['id'] not in notified_list:
                    # THE KICK: Trigger the push notification logic
                    send_critical_notification(s['name'], level)
                    notified_list.add(s['id'])
            else:
                # Reset so it can alert again if it goes back to critical later
                notified_list.discard(s['id'])

            # API Update for Web Dashboard
            try:
                requests.post(API_URL, json={
                    "station_id": s['id'], 
                    "water_level": level, 
                    "timestamp": time.strftime("%H:%M:%S"), 
                    "status": status
                }, timeout=2)
            except: pass
        
        time.sleep(10)