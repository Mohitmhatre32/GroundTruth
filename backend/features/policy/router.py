from fastapi import APIRouter, HTTPException
from .service import get_policy_classification

router = APIRouter()

@router.get("/map-classification")
def get_map_data():
    try:
        return get_policy_classification()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))