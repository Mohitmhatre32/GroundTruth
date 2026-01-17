from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import simulate_dual_models # 👈 Updated name

router = APIRouter()

class ScenarioInput(BaseModel):
    station_id: str
    rainfall_change_pct: float
    extraction_change_pct: float

@router.post("/simulate_scenario")
def run_simulation(data: ScenarioInput):
    try:
        # 👈 Updated function call
        return simulate_dual_models(
            station_id=data.station_id,
            rain_pct=data.rainfall_change_pct,
            ext_pct=data.extraction_change_pct
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/research/export-data")
def export_research_data():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'r') as f:
            return {"csv_content": f.read()}
    return {"error": "No data found"}