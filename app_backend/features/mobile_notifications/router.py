import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import update_station_data

router = APIRouter()

# Helper to find names from stations.json
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_name(station_id):
    if os.path.exists(STATIONS_FILE):
        with open(STATIONS_FILE, 'r') as f:
            stations = json.load(f)
            for s in stations:
                if s['id'] == station_id:
                    return s['name']
    return station_id

class ReadingInput(BaseModel):
    station_id: str
    water_level: float
    status: str
    timestamp: str

@router.post("/update_reading")
async def receive_reading(reading: ReadingInput):
    try:
        # 1. Get Pretty Name (Ludhiana North, etc.)
        real_name = get_station_name(reading.station_id)

        # 2. Update Database for Web Dashboard
        result = update_station_data(
            station_id=reading.station_id,
            water_level=reading.water_level,
            location_name=real_name,
            status=reading.status
        )
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"❌ ROUTER ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))