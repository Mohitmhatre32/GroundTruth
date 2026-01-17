from fastapi import APIRouter, HTTPException
from .service import get_live_rainfall
import json, os

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

@router.get("/live/{station_id}")
async def get_weather_for_station(station_id: str):
    with open(STATIONS_FILE, 'r') as f:
        stations = json.load(f)
        station = next((s for s in stations if s['id'] == station_id), None)
    
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    weather = get_live_rainfall(station['lat'], station['lng'])
    return weather