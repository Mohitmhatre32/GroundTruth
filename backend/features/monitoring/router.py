import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the Monitoring Service
from .service import update_station_data
# 👇 Import the new Alert Service
from features.alerts.service import create_alert

router = APIRouter()

# Helper to find names
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
        real_name = get_station_name(reading.station_id)

        # 1. Update Live Status
        result = update_station_data(
            station_id=reading.station_id,
            water_level=reading.water_level,
            location_name=real_name,
            status=reading.status
        )
        
        # 2. 👇 CHECK FOR ALERTS
        # Only trigger if status is Critical.
        # (In a real app, we would add debounce logic here to stop spamming)
        if reading.status == "Critical":
            create_alert(
                station_id=reading.station_id,
                location_name=real_name,
                water_level=reading.water_level
            )

        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/live_status")
async def get_all_readings():
    try:
        from .service import get_live_readings
        data = get_live_readings()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
