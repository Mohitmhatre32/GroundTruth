from datetime import datetime
from config import get_db
from .fcm import send_token_push # Import from the file we made above

def send_critical_notification(station_name, depth):
    db = get_db()
    
    # 1. Get all registered device tokens from Firestore
    devices = db.collection("registered_mobile_devices").stream()
    tokens = [doc.to_dict().get('fcm_token') for doc in devices if doc.to_dict().get('fcm_token')]

    if not tokens:
        print("⚠️ No devices registered. Cannot send push.")
        return

    title = "🚨 Groundwater Alert"
    body = f"{station_name} is in CRITICAL zone ({depth}m)!"

    # 2. Send push to every registered device
    for user_token in tokens:
        try:
            send_token_push(user_token, title, body, station_name)
            print(f"🚀 Push sent to device for {station_name}")
        except Exception as e:
            print(f"❌ FCM Send Error: {e}")

    # 3. Store in History for the App's Inbox
    db.collection("mobile_alerts_history").add({
        "title": title,
        "body": body,
        "station_name": station_name,
        "depth": depth,
        "timestamp": datetime.utcnow()
    })