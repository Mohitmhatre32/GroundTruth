import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import update_station_data

router = APIRouter()

# 1. Load Station Names Lookup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_name(station_id):
    """Finds the pretty name for an ID (e.g., STN_NORTH -> North District)"""
    if os.path.exists(STATIONS_FILE):
        with open(STATIONS_FILE, 'r') as f:
            stations = json.load(f)
            for s in stations:
                if s['id'] == station_id:
                    return s['name']
    return station_id # Fallback to ID if name not found

class ReadingInput(BaseModel):
    station_id: str
    water_level: float
    status: str
    timestamp: str

@router.post("/update_reading")
async def receive_reading(reading: ReadingInput):
    try:
        # 2. Get the Real Name
        real_name = get_station_name(reading.station_id)

        result = update_station_data(
            station_id=reading.station_id,
            water_level=reading.water_level,
            location_name=real_name,  # 👈 Now sending the Pretty Name
            status=reading.status
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))