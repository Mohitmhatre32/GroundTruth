"""
FCM (Firebase Cloud Messaging) Service for sending push notifications
"""

import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
from config import get_db
import os

# Load Firebase credentials once
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIREBASE_KEY = os.path.join(BASE_DIR, "serviceAccountKey.json")

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(FIREBASE_KEY)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized for FCM")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase Admin: {e}")


def save_device_token(device_id: str, token: str, device_type: str = "android", device_name: str = "Unknown"):
    """
    Save or update device FCM token in Firestore
    
    Args:
        device_id: Unique device identifier
        token: FCM registration token
        device_type: android/ios
        device_name: Human-readable device name
    """
    db = get_db()
    
    device_data = {
        "device_id": device_id,
        "token": token,
        "device_type": device_type,
        "device_name": device_name,
        "last_updated": datetime.utcnow(),
        "active": True
    }
    
    print(f"📱 Saving device token:")
    print(f"   Device ID: {device_id}")
    print(f"   Token: {token[:20]}...")
    print(f"   Type: {device_type}")
    
    try:
        # Use device_id as document ID to prevent duplicates
        db.collection("fcm_devices").document(device_id).set(device_data, merge=True)
        print(f"✅ Device token saved successfully")
        return device_data
    except Exception as e:
        print(f"❌ Failed to save device token: {e}")
        raise


def get_all_active_tokens():
    """Get all active FCM tokens from Firestore"""
    db = get_db()
    
    try:
        devices_ref = db.collection("fcm_devices").where("active", "==", True)
        devices = devices_ref.stream()
        
        tokens = []
        for device_doc in devices:
            device_data = device_doc.to_dict()
            if device_data.get('token'):
                tokens.append({
                    'token': device_data['token'],
                    'device_id': device_data.get('device_id'),
                    'device_type': device_data.get('device_type', 'android')
                })
        
        print(f"📱 Found {len(tokens)} active devices")
        return tokens
    except Exception as e:
        print(f"❌ Failed to fetch device tokens: {e}")
        return []


def send_alert_notification(alert_data: dict):
    """
    Send FCM notification for an alert to all registered devices
    
    Args:
        alert_data: Alert dictionary with keys: alert_id, message, severity/type, station_id, location
    """
    
    if not firebase_admin._apps:
        print("❌ Cannot send notification - Firebase Admin not initialized")
        return {"success": 0, "failed": 0}
    
    print(f"\n{'='*60}")
    print(f"📤 SENDING FCM NOTIFICATION")
    print(f"{'='*60}")
    
    # Get all active device tokens
    devices = get_all_active_tokens()
    
    if not devices:
        print("⚠️  No active devices to send notifications to")
        return {"success": 0, "failed": 0}
    
    # Prepare notification data
    severity = alert_data.get('severity', alert_data.get('type', 'MEDIUM')).upper()
    
    # Extract title from message if not present
    title = alert_data.get('title', '')
    if not title:
        message_text = alert_data.get('message', 'Alert Notification')
        title = message_text.split('.')[0][:50]  # First sentence, max 50 chars
    
    body = alert_data.get('message', 'Check the app for details')
    
    print(f"Alert ID: {alert_data.get('alert_id', alert_data.get('id', 'unknown'))}")
    print(f"Title: {title}")
    print(f"Severity: {severity}")
    print(f"Devices: {len(devices)}")
    
    # Notification data payload
    data_payload = {
        'severity': severity,
        'alert_id': str(alert_data.get('alert_id', alert_data.get('id', ''))),
        'station_id': str(alert_data.get('station_id', '')),
        'type': 'alert',
        'location': str(alert_data.get('location', '')),
    }
    
    # Add water_level if present
    if 'water_level' in alert_data:
        data_payload['water_level'] = str(alert_data['water_level'])
    
    success_count = 0
    failed_count = 0
    
    # Send to each device
    for device in devices:
        token = device['token']
        device_id = device.get('device_id', 'unknown')
        
        print(f"\n📡 Sending to device: {device_id}")
        
        # Create message
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data_payload,
            token=token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    channel_id='alert_channel',
                    priority='max' if severity == 'CRITICAL' else 'high',
                    sound='default',
                    color='#FF0000' if severity == 'CRITICAL' else '#FFA500',
                ),
            ),
        )
        
        try:
            response = messaging.send(message)
            success_count += 1
            print(f"   ✅ Sent successfully - Message ID: {response}")
        except messaging.ApiCallError as e:
            failed_count += 1
            print(f"   ❌ FCM API Error: {e.code} - {e.message}")
            
            # If token is invalid, mark device as inactive
            if e.code in ['NOT_FOUND', 'UNREGISTERED', 'INVALID_ARGUMENT']:
                print(f"   🔄 Marking device {device_id} as inactive")
                _deactivate_device(device_id)
                
        except Exception as e:
            failed_count += 1
            print(f"   ❌ Unexpected error: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"📊 NOTIFICATION SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Sent successfully: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📱 Total devices: {len(devices)}")
    print(f"{'='*60}\n")
    
    return {"success": success_count, "failed": failed_count, "total": len(devices)}


def _deactivate_device(device_id: str):
    """Mark a device as inactive (invalid token)"""
    db = get_db()
    try:
        db.collection("fcm_devices").document(device_id).update({"active": False})
    except Exception as e:
        print(f"   ⚠️  Could not deactivate device: {e}")


def send_test_notification(token: str):
    """
    Send a test notification to a specific token
    
    Args:
        token: FCM registration token
    """
    if not firebase_admin._apps:
        print("❌ Cannot send test notification - Firebase Admin not initialized")
        return None
    
    message = messaging.Message(
        notification=messaging.Notification(
            title='🔔 Test Notification',
            body='This is a test notification from GroundTruth backend',
        ),
        data={
            'type': 'test',
            'severity': 'INFO',
        },
        token=token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='alert_channel',
                priority='high',
            ),
        ),
    )
    
    try:
        response = messaging.send(message)
        print(f"✅ Test notification sent successfully")
        print(f"   Message ID: {response}")
        return response
    except Exception as e:
        print(f"❌ Failed to send test notification: {e}")
        raise


# Legacy functions for backward compatibility
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
    return response


def send_token_push(token, title, body, station_name):
    """Sends directly to a specific device token"""
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


def send_critical_notification(station_name: str, water_level: float):
    """Send critical alert to topic subscribers"""
    message = messaging.Message(
        notification=messaging.Notification(
            title="🚨 Groundwater Alert",
            body=f"{station_name} is CRITICAL!\nWater Level: {water_level} mbgl"
        ),
        topic="groundtruth_alerts"
    )
    response = messaging.send(message)
    print("📲 Notification sent:", response)
    return response
