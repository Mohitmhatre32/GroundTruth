from fastapi import APIRouter
from .service import get_ndvi_simulation

router = APIRouter()

@router.get("/ndvi-layer")
async def get_satellite_data():
    return get_ndvi_simulation()