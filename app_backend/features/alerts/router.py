from fastapi import APIRouter, HTTPException
from .service import get_alerts, create_alert
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class AlertResponse(BaseModel):
    alert_id: str
    station_id: str
    location: str
    water_level: float
    message: str
    timestamp: str
    type: str
    is_read: bool

@router.get("/alerts", response_model=List[AlertResponse])
async def fetch_alerts(limit: int = 50):
    """
    Get all recent alerts.
    """
    try:
        alerts = get_alerts(limit=limit)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AlertCreate(BaseModel):
    station_id: str
    location_name: str
    water_level: float

@router.post("/alerts", response_model=AlertResponse)
async def trigger_alert(alert: AlertCreate):
    """
    Manually trigger an alert (for testing or external systems).
    """
    try:
        new_alert = create_alert(
            station_id=alert.station_id,
            location_name=alert.location_name,
            water_level=alert.water_level
        )
        # Convert timestamp to string if it's a datetime object
        if hasattr(new_alert["timestamp"], "isoformat"):
            new_alert["timestamp"] = new_alert["timestamp"].isoformat()
        return new_alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
