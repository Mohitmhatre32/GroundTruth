import json
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_ndvi_simulation():
    """
    Generates a simulated NDVI (Vegetation) Layer.
    Creates small circular polygons around each station coordinate.
    """
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)

    features = []
    for s in stations:
        # Simulate a NDVI value between 0.2 (Arid) and 0.9 (Lush)
        # Randomize it to simulate 'Illegal Pumping' in some areas
        ndvi_val = random.uniform(0.3, 0.85)
        
        # Determine Color based on NDVI
        color = "#ff0000" # Dead
        if ndvi_val > 0.7: color = "#006400" # Deep Forest
        elif ndvi_val > 0.5: color = "#228B22" # Healthy Crop
        elif ndvi_val > 0.3: color = "#9ACD32" # Grassland

        features.append({
            "type": "Feature",
            "properties": {
                "station_id": s['id'],
                "ndvi_score": round(ndvi_val, 2),
                "fill": color
            },
            "geometry": {
                "type": "Point",
                "coordinates": [s['lng'], s['lat']]
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }