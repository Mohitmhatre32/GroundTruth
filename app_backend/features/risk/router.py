from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import calculate_risk_assessment

router = APIRouter()

class RiskInput(BaseModel):
    rainfall: float
    area: float
    population: int
    crop_area: float
    scenario: str

@router.post("/analyze-risk")
def get_risk_analysis(data: RiskInput):
    try:
        return calculate_risk_assessment(
            rainfall_mm=data.rainfall,
            area_sq_km=data.area,
            population=data.population,
            crop_area_sq_km=data.crop_area,
            scenario=data.scenario
        )
    except Exception as e:
        # This will print the actual error to your terminal if it crashes
        print(f"RISK CALCULATION ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))