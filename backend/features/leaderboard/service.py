import json
import os
from config import get_db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_rankings():
    db = get_db()
    # 1. Fetch current live data from Firebase
    docs = db.collection("live_monitoring").stream()
    live_data = {doc.id: doc.to_dict() for doc in docs}

    # 2. Fetch static station details
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)

    rankings = []
    for s in stations:
        stn_id = s['id']
        # Default if no live data yet
        current_depth = live_data.get(stn_id, {}).get('water_level', s['base_level_mbgl'])
        
        # --- SUSTAINABILITY SCORE CALCULATION ---
        # Factor A: Depth (0-50 pts). shallow (0m) = 50, deep (100m+) = 0.
        depth_score = max(0, 50 - (current_depth / 2))
        
        # Factor B: Infiltration potential (0-50 pts). Based on Soil Infiltration Factor.
        inf_score = s.get('infiltration_factor', 0.15) * 200 # e.g. 0.25 * 200 = 50 pts
        
        total_score = round(depth_score + inf_score, 1)

        rankings.append({
            "name": s['name'],
            "score": total_score,
            "depth": current_depth,
            "status": "Healthy" if total_score > 70 else ("Caution" if total_score > 40 else "Stressed")
        })

    # Sort by score descending
    return sorted(rankings, key=lambda x: x['score'], reverse=True)