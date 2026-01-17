from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import get_db
from .service import register_device_token

router = APIRouter()

# Matches the data structure sent by the Flutter 'Dio' request
class DeviceTokenInput(BaseModel):
    token: str
    device_type: str
    device_id: str
    device_name: str

@router.post("/register-device/")
async def register_device(data: DeviceTokenInput):
    """
    Receives the FCM token from Flutter and saves it to Firestore.
    """
    try:
        register_device_token(
            token=data.token,
            device_id=data.device_id,
            device_name=data.device_name,
            device_type=data.device_type
        )
        return {"status": "success", "message": "Device registered for alerts"}
    except Exception as e:
        print(f"❌ Registration Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts-history")
def get_alerts_history():
    """Returns history for the mobile inbox"""
    db = get_db()
    docs = db.collection("mobile_alerts_history").order_by("timestamp", direction="DESCENDING").limit(50).stream()
    return [{**doc.to_dict(), "id": doc.id, "timestamp": doc.to_dict()['timestamp'].strftime("%Y-%m-%d %H:%M:%S")} for doc in docs]