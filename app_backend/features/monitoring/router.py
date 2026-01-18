from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import update_station_data
import json, os

router = APIRouter()

# 1. Define the data model the simulator sends
class ReadingInput(BaseModel):
    station_id: str
    water_level: float
    status: str
    timestamp: str

# 2. Name Lookup Helper
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_name(sid):
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)
        for s in stations:
            if s['id'] == sid: return s['name']
    return sid

@router.post("/update_reading")
async def receive_reading(reading: ReadingInput):
    try:
        # We fetch the location_name here so the simulator doesn't have to send it
        real_name = get_station_name(reading.station_id)

        # Call the service function provided in your prompt
        result = update_station_data(
            station_id=reading.station_id,
            water_level=reading.water_level,
            location_name=real_name,
            status=reading.status
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))