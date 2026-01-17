import json
import os
import math
import time
import random
from fastapi import APIRouter, HTTPException

router = APIRouter()

# Path to your master data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def calculate_current_level(base_level):
    """
    Replicates the Simulator logic to give the Mobile App 
    a 'Live' reading without needing to query Firestore database.
    """
    current_hour = time.localtime().tm_hour
    # Daily fluctuation pattern (Sine wave)
    daily_pattern = math.sin((current_hour / 24) * 2 * math.pi) * 0.3
    # Random noise (Simulates sensor jitter)
    noise = random.uniform(-0.5, 0.5)
    
    return round(base_level + daily_pattern + noise, 2)

@router.get("/stations")
def get_mobile_stations():
    """
    Screen 3 Data Source:
    Returns list of stations with Location (Lat/Lng) and Live Status.
    """
    if not os.path.exists(STATIONS_FILE):
        return []

    try:
        with open(STATIONS_FILE, 'r') as f:
            stations = json.load(f)

        response_data = []
        
        for s in stations:
            # 1. Calculate Live Level
            live_level = calculate_current_level(s['base_level_mbgl'])
            
            # 2. Determine Status Color
            status = "Safe"
            if live_level > 30: status = "Critical"
            elif live_level > 20: status = "Semi-Critical"

            # 3. Build Response Object
            response_data.append({
                "id": s['id'],
                "name": s['name'],
                "latitude": s['lat'],
                "longitude": s['lng'],
                "current_depth_m": live_level,
                "status": status,
                "region": "North India" # Example extra field
            })
            
        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))