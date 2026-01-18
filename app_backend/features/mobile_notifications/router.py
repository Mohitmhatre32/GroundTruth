import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import update_station_data
from .fcm import save_device_token, send_test_notification

# Import alerts service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from features.alerts.service import get_alerts

router = APIRouter()

# Helper to find names from stations.json
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIONS_FILE = os.path.join(BASE_DIR, "stations.json")

def get_station_name(station_id):
    if os.path.exists(STATIONS_FILE):
        with open(STATIONS_FILE, 'r') as f:
            stations = json.load(f)
            for s in stations:
                if s['id'] == station_id:
                    return s['name']
    return station_id

class ReadingInput(BaseModel):
    station_id: str
    water_level: float
    status: str
    timestamp: str

class DeviceRegistration(BaseModel):
    token: str
    device_type: str = "android"
    device_id: str
    device_name: str = "Unknown Device"

@router.post("/register-device/")
async def register_device(device: DeviceRegistration):
    """
    Register or update a device's FCM token in Firestore
    """
    print(f"\n📱 Device Registration Request:")
    print(f"   Device ID: {device.device_id}")
    print(f"   Device Type: {device.device_type}")
    print(f"   Token: {device.token[:20]}...")
    
    try:
        result = save_device_token(
            device_id=device.device_id,
            token=device.token,
            device_type=device.device_type,
            device_name=device.device_name
        )
        
        print(f"✅ Device registered successfully")
        
        return {
            "status": "success",
            "message": "Device registered successfully",
            "device_id": device.device_id
        }
    except Exception as e:
        print(f"❌ Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-notification/")
async def test_notification(device: DeviceRegistration):
    """
    Send a test notification to a specific device token
    """
    print(f"\n🔔 Test Notification Request:")
    print(f"   Token: {device.token[:20]}...")
    
    try:
        response = send_test_notification(device.token)
        return {
            "status": "success",
            "message": "Test notification sent",
            "message_id": response
        }
    except Exception as e:
        print(f"❌ Test notification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/")
async def fetch_alerts_mobile(limit: int = 50):
    """
    Get alerts for mobile app
    """
    try:
        alerts = get_alerts(limit=limit)
        return alerts
    except Exception as e:
        print(f"❌ Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update_reading")
async def receive_reading(reading: ReadingInput):
    try:
        # 1. Get Pretty Name (Ludhiana North, etc.)
        real_name = get_station_name(reading.station_id)

        # 2. Update Database for Web Dashboard
        result = update_station_data(
            station_id=reading.station_id,
            water_level=reading.water_level,
            location_name=real_name,
            status=reading.status
        )
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"❌ ROUTER ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
