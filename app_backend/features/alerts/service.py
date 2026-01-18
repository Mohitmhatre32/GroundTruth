from datetime import datetime
from config import get_db

COLLECTION_NAME = "alerts"

def create_alert(station_id: str, location_name: str, water_level: float):
    """
    Creates a high-priority alert in Firestore and sends FCM notification.
    """
    db = get_db()
    
    # Create a unique-ish ID based on time so we don't overwrite old alerts
    # In a real app, you'd check if an active alert already exists to avoid duplicates.
    alert_id = f"{station_id}_{int(datetime.utcnow().timestamp())}"
    
    alert_data = {
        "alert_id": alert_id,
        "station_id": station_id,
        "location": location_name,
        "water_level": water_level,
        "message": f"CRITICAL: Water level dropped to {water_level}m in {location_name}!",
        "timestamp": datetime.utcnow(),
        "type": "CRITICAL",  # Could be WARNING or INFO
        "is_read": False
    }
    
    # Save to 'alerts' collection
    db.collection(COLLECTION_NAME).document(alert_id).set(alert_data)
    print(f"⚠️  ALERT TRIGGERED: {location_name}")
    
    # Send FCM notification to all registered devices
    try:
        from features.mobile_notifications.fcm import send_alert_notification
        
        print(f"📤 Triggering FCM notification for alert {alert_id}")
        notification_result = send_alert_notification(alert_data)
        print(f"📊 FCM Result: {notification_result}")
    except Exception as e:
        print(f"❌ Failed to send FCM notification: {e}")
        # Don't fail the alert creation if notification fails
    
    return alert_data

def get_alerts(limit: int = 50):
    """
    Fetches the latest alerts from Firestore.
    """
    db = get_db()
    alerts_ref = db.collection(COLLECTION_NAME).order_by("timestamp", direction="DESCENDING").limit(limit)
    docs = alerts_ref.stream()
    
    alerts = []
    for doc in docs:
        alert = doc.to_dict()
        # Convert datetime to string for JSON serialization if it's a datetime object
        if "timestamp" in alert and hasattr(alert["timestamp"], "isoformat"):
            alert["timestamp"] = alert["timestamp"].isoformat()
        alerts.append(alert)
    
    return alerts