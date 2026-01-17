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

# Import the notification service for the mobile "kick"
# We wrap this in a try/except to handle cases where the simulator is run standalone
try:
    from features.mobile_notifications.service import send_critical_notification
except ImportError:
    # This path fix allows the script to find the service when run via main.py
    sys.path.append(BASE_DIR)
    from features.mobile_notifications.service import send_critical_notification

# Track which stations have already sent a mobile notification
# to avoid spamming the user's phone every 10 seconds.
notified_stations = set()

def load_stations():
    try:
        with open(STATIONS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: stations.json not found at {STATIONS_FILE}")
        sys.exit(1)

def generate_reading(station_id, base_level, hour):
    """
    Simulates sensor jitter and daily usage patterns.
    Safe: <20m | Semi-Critical: 20-30m | Critical: >30m
    """
    noise = random.uniform(-1.0, 1.0)
    pattern = math.sin((hour / 24) * 2 * math.pi) * 0.5
    level = base_level + noise + pattern
    return round(level, 2)

def run_simulation():
    """
    Main loop that pushes data to the API and kicks the mobile app on critical events.
    """
    stations = load_stations()
    print(f"🚀 GroundTruth Simulator Active.")
    print(f"📡 Pushing Safe 🟢, Semi-Critical 🟡, and Critical 🔴 data to Dashboard & Mobile.")

    while True:
        current_hour = time.localtime().tm_hour
        
        for station in stations:
            level = generate_reading(station['id'], station['base_level_mbgl'], current_hour)
            
            # --- 3-TIER CLASSIFICATION LOGIC ---
            status = "Safe"
            if level > 30:
                status = "Critical"
                
                # --- MOBILE NOTIFICATION LOGIC (THE KICK) ---
                # Only send if we haven't already notified for this specific "event"
                if station['id'] not in notified_stations:
                    print(f"⚠️ ALERT TRIGGERED: {station['name']} entering Critical Zone. Kicking Mobile App...")
                    try:
                        send_critical_notification(station['name'], level)
                        notified_stations.add(station['id']) # Mark as notified
                    except Exception as e:
                        print(f"❌ Failed to kick mobile app: {e}")
            
            elif level > 20:
                status = "Semi-Critical"
                # Reset notification state if it moves from Critical to Semi-Critical
                notified_stations.discard(station['id'])
            
            else:
                status = "Safe"
                # Reset notification state if it moves to Safe
                notified_stations.discard(station['id'])
            
            # --- PREPARE API PAYLOAD ---
            payload = {
                "station_id": station['id'],
                "water_level": level,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "status": status
            }
            
            # --- PUSH TO FASTAPI ---
            try:
                requests.post(API_URL, json=payload, timeout=2)
                
                # Console Logging
                icon = "🔴" if status == "Critical" else ("🟡" if status == "Semi-Critical" else "🟢")
                print(f"{icon} {station['name']}: {level}m ({status})")
            except Exception as e:
                print(f"❌ API Push Failed: {e}")

        print("-" * 40)
        time.sleep(10) # Updates every 10 seconds

if __name__ == "__main__":
    # This allows running 'python simulator.py' manually if needed
    run_simulation()