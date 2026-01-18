import firebase_admin
from firebase_admin import credentials, messaging
import os

# Load Firebase credentials once
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIREBASE_KEY = os.path.join(BASE_DIR, "serviceAccountKey.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY)
    firebase_admin.initialize_app(cred)

def send_topic_push(station_name: str, water_level: float):
    """Broadcasts to anyone subscribed to the alerts topic"""
    message = messaging.Message(
        notification=messaging.Notification(
            title="🚨 Groundwater Alert",
            body=f"{station_name} is CRITICAL!\nWater Level: {water_level} mbgl"
        ),
        topic="groundtruth_alerts"
    )
    response = messaging.send(message)
    print("📲 Topic Notification sent:", response)

def send_token_push(token, title, body, station_name):
    """Sends directly to a specific device token (Friend's logic)"""
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data={
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "screen": "critical_inbox",
            "station": station_name
        },
        token=token,
    )
    response = messaging.send(message)
    return response
