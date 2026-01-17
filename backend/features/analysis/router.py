from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import os
from .service import calculate_zone_budget

router = APIRouter()

# Helper to get list of stations for the dropdown
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

class SimulationInput(BaseModel):
    station_id: str
    rainfall: float        # User slider input
    extraction_percent: float # User slider (e.g., 100% is normal, 80% is savings)

@router.get("/zones")
def get_zones():
    """Returns list of zones for the dropdown"""
    if os.path.exists(STATIONS_FILE):
        with open(STATIONS_FILE, 'r') as f:
            return json.load(f)
    return []

@router.post("/analyze-zone")
def analyze_specific_zone(data: SimulationInput):
    try:
        # Convert percent to modifier (100% -> 1.0)
        modifier = data.extraction_percent / 100.0
        
        result = calculate_zone_budget(
            station_id=data.station_id,
            rainfall_mm=data.rainfall,
            extraction_modifier=modifier
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))