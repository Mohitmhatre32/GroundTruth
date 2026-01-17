from fastapi import APIRouter
from .service import get_rankings

router = APIRouter()

@router.get("/rankings")
async def get_performance_leaderboard():
    return get_rankings()