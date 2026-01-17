import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_policy_classification():
    """
    Classifies all zones into Safe, Semi-Critical, and Critical 
    based on static geological data and baseline depletion.
    """
    if not os.path.exists(STATIONS_FILE):
        return []

    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)

    classified_zones = []
    
    for s in stations:
        # Policy Logic:
        # Critical: Depth > 30m
        # Semi-Critical: Depth between 20m and 30m
        # Safe: Depth < 20m
        
        level = s['base_level_mbgl']
        status = "Safe"
        color = "Green"
        
        if level > 30:
            status = "Critical"
            color = "Red"
        elif level > 20:
            status = "Semi-Critical"
            color = "Yellow"

        classified_zones.append({
            "id": s['id'],
            "name": s['name'],
            "lat": s['lat'],
            "lng": s['lng'],
            "baseline_level": level,
            "status": status,
            "color": color,
            "policy_recommendation": get_recommendation(status)
        })

    return classified_zones

def get_recommendation(status):
    if status == "Critical":
        return "Immediate Ban on Industrial Extraction. Promote Crop Diversification."
    elif status == "Semi-Critical":
        return "Mandatory Rainwater Harvesting. Monitor Weekly."
    return "Maintain Current Levels. Routine Monitoring."