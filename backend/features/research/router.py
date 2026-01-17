from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import simulate_scenario_logic
import os

router = APIRouter()

class ScenarioInput(BaseModel):
    station_id: str
    rainfall_change_pct: float
    extraction_change_pct: float

@router.post("/simulate_scenario")
def run_simulation(data: ScenarioInput):
    try:
        return simulate_scenario_logic(
            station_id=data.station_id,
            rain_pct=data.rainfall_change_pct,
            ext_pct=data.extraction_change_pct
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/research/export-data")
def export_research_data():
    """Allows researchers to download the raw training data"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")
    
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'r') as f:
            content = f.read()
        return {"csv_content": content}
    return {"error": "No data found"}