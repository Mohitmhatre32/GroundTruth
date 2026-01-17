from firebase_admin import messaging
from config import get_db
from datetime import datetime

def register_device_token(token, device_id, device_name, device_type):
    """
    Saves the full mobile device profile in the database.
    (Matches the Flutter code your friend wrote)
    """
    db = get_db()
    device_ref = db.collection("registered_mobile_devices").document(device_id)
    
    device_data = {
        "fcm_token": token,
        "device_name": device_name,
        "device_type": device_type,
        "device_id": device_id,
        "last_updated": datetime.utcnow(),
    }
    
    device_ref.set(device_data, merge=True)
    print(f"✅ Device Linked: {device_name}")

def send_critical_notification(station_name, depth):
    """
    Finds all registered user tokens and sends the push notification 
    using the logic your friend provided.
    """
    db = get_db()
    
    # 1. Fetch all tokens from our database
    devices = db.collection("registered_mobile_devices").stream()
    tokens = [d.to_dict().get('fcm_token') for d in devices if d.to_dict().get('fcm_token')]

    if not tokens:
        print("⚠️ No mobile devices registered. Skipping push.")
        return

    title = "🚨 Groundwater Alert"
    body = f"{station_name} level is in CRITICAL zone ({depth}m). Please conserve water!"

    # 2. Loop through tokens and send (Following friend's sample logic)
    for user_token in tokens:
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                token=user_token, # Using the specific token for this user
                data={
                    "screen": "critical_inbox",
                    "station": station_name
                }
            )
            response = messaging.send(message)
            print(f"🚀 Push sent to token: ...{user_token[-10:]} | Status: {response}")
        except Exception as e:
            print(f"❌ Failed to send to a token: {e}")

    # 3. Add to Mobile Inbox History
    db.collection("mobile_alerts_history").add({
        "title": title,
        "body": body,
        "station_name": station_name,
        "depth": depth,
        "timestamp": datetime.utcnow()
    })