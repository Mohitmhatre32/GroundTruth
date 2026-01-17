from fastapi import APIRouter
from .service import calculate_economic_impact

router = APIRouter()

@router.get("/calculate/{mcm_saved}")
async def get_savings(mcm_saved: float):
    return calculate_economic_impact(mcm_saved)