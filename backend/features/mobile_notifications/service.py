from firebase_admin import messaging
from config import get_db
from datetime import datetime

def register_device_token(token, device_id, device_name, device_type):
    """
    Saves the full mobile device profile into Firestore.
    This matches the specific dictionary required for the mobile app.
    """
    db = get_db()
    
    # We use device_id as the document name to prevent duplicate entries for the same phone
    device_ref = db.collection("registered_mobile_devices").document(device_id)
    
    device_data = {
        "fcm_token": token,
        "device_name": device_name,
        "device_type": device_type,
        "device_id": device_id,
        "last_updated": datetime.utcnow(),
    }
    
    # .set with merge=True will create it if new, or update fields if it exists
    device_ref.set(device_data, merge=True)
    print(f"✅ DB Sync: Mobile Device '{device_name}' is now registered for alerts.")

def send_critical_notification(station_name, depth):
    """
    Fetches all registered tokens from the DB and sends the alert 
    using the logic your friend provided.
    """
    db = get_db()
    
    # 1. Fetch all tokens from the 'registered_mobile_devices' collection
    devices = db.collection("registered_mobile_devices").stream()
    tokens = [doc.to_dict().get('fcm_token') for doc in devices if doc.to_dict().get('fcm_token')]

    if not tokens:
        print("⚠️ Alert Triggered, but no mobile devices are registered in DB.")
        return

    title = "🚨 Groundwater Alert"
    body = f"{station_name} level is in CRITICAL zone ({depth}m). Please conserve water!"

    # 2. Loop through and send to each token (Friend's specific requirement)
    for user_token in tokens:
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                token=user_token,
                data={
                    "click_action": "FLUTTER_NOTIFICATION_CLICK",
                    "screen": "critical_inbox",
                    "station": station_name
                }
            )
            response = messaging.send(message)
            print(f"🚀 Push sent to {user_token[:10]}... | Status: {response}")
        except Exception as e:
            print(f"❌ Failed to send to token {user_token[:10]}: {e}")

    # 3. Store the alert in history for the Mobile Inbox Screen
    db.collection("mobile_alerts_history").add({
        "title": title,
        "body": body,
        "station_name": station_name,
        "depth": depth,
        "timestamp": datetime.utcnow()
    })