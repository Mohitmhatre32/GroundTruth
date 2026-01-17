from datetime import datetime
from config import get_db 

COLLECTION_NAME = "live_monitoring"

# Ensure this has 4 parameters: station_id, water_level, location_name, status
def update_station_data(station_id: str, water_level: float, location_name: str, status: str):
    db = get_db()
    
    data_payload = {
        "station_id": station_id,
        "location": location_name,
        "water_level": water_level,
        "last_updated": datetime.utcnow(),
        "status": status  # This saves the Safe/Semi-Critical/Critical status
    }
    
    # We use station_id as the document ID to prevent duplicates
    db.collection(COLLECTION_NAME).document(station_id).set(data_payload, merge=True)
    return data_payload