from datetime import datetime
from config import get_db 

COLLECTION_NAME = "live_monitoring"

# 👇 Added 'status' parameter here
def update_station_data(station_id: str, water_level: float, location_name: str, status: str):
    db = get_db()
    
    data_payload = {
        "station_id": station_id,
        "location": location_name,
        "water_level": water_level,
        "last_updated": datetime.utcnow(),
        "status": status  # 👇 Now using the actual status from the simulator
    }
    
    db.collection(COLLECTION_NAME).document(station_id).set(data_payload, merge=True)
    return data_payload

def get_live_readings():
    db = get_db()
    docs = db.collection(COLLECTION_NAME).stream()
    return [doc.to_dict() for doc in docs]
