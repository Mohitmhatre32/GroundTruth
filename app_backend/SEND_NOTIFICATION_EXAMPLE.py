"""
Example script to send FCM notifications from backend
This shows all the debug messages you should see
"""

from firebase_admin import messaging, credentials, initialize_app
import firebase_admin

# Initialize Firebase Admin (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred)

def send_test_notification(device_token: str):
    """
    Send a test notification to a specific device token
    
    Args:
        device_token: FCM token from Flutter app logs
    """
    
    print("\n" + "="*50)
    print("📤 SENDING FCM NOTIFICATION")
    print("="*50)
    
    # Prepare notification data
    alert_data = {
        'title': 'Test Critical Alert',
        'message': 'This is a test notification from backend',
        'severity': 'CRITICAL',
        'alert_id': 'test_123',
        'station_id': 'STN_TEST',
    }
    
    print(f"\n📋 Notification Details:")
    print(f"   Title: {alert_data['title']}")
    print(f"   Message: {alert_data['message']}")
    print(f"   Severity: {alert_data['severity']}")
    print(f"   To Token: {device_token[:20]}...")
    
    # Create FCM message
    message = messaging.Message(
        notification=messaging.Notification(
            title=alert_data['title'],
            body=alert_data['message'],
        ),
        data={
            'severity': alert_data['severity'],
            'alert_id': alert_data['alert_id'],
            'station_id': alert_data['station_id'],
            'type': 'alert',
        },
        token=device_token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='alert_channel',
                priority='max' if alert_data['severity'] == 'CRITICAL' else 'high',
                sound='default',
            ),
        ),
    )
    
    print(f"\n📡 Sending to Firebase Cloud Messaging...")
    
    try:
        # Send the message
        response = messaging.send(message)
        
        print(f"\n✅ SUCCESS!")
        print(f"   Message ID: {response}")
        print(f"   Status: Sent successfully")
        
        print(f"\n👀 Now check your Flutter app:")
        print(f"   - If app is OPEN: Look for '📬 Foreground Message Received!'")
        print(f"   - If app is CLOSED: Check notification tray")
        print(f"   - Run: flutter logs | grep 'Message Received'")
        
        return response
        
    except messaging.ApiCallError as e:
        print(f"\n❌ FCM API ERROR!")
        print(f"   Error Code: {e.code}")
        print(f"   Message: {e.message}")
        print(f"\n🔍 Common causes:")
        print(f"   - Invalid FCM token (token expired or app uninstalled)")
        print(f"   - Wrong service account key")
        print(f"   - Token from different Firebase project")
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR!")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")


def send_notification_to_all_devices(db_connection):
    """
    Send notification to all registered devices in database
    
    Args:
        db_connection: Firestore database connection
    """
    
    print("\n" + "="*50)
    print("📤 SENDING TO ALL REGISTERED DEVICES")
    print("="*50)
    
    # Fetch all device tokens from Firestore
    devices_ref = db_connection.collection('devices')
    devices = devices_ref.stream()
    
    sent_count = 0
    failed_count = 0
    
    for device_doc in devices:
        device_data = device_doc.to_dict()
        token = device_data.get('token')
        device_id = device_data.get('device_id', 'unknown')
        
        if not token:
            print(f"⚠️  Skipping device {device_id} - no token")
            continue
        
        print(f"\n📱 Sending to device: {device_id}")
        print(f"   Token: {token[:20]}...")
        
        try:
            response = send_test_notification(token)
            if response:
                sent_count += 1
                print(f"   ✅ Sent successfully")
        except Exception as e:
            failed_count += 1
            print(f"   ❌ Failed: {str(e)}")
    
    print(f"\n" + "="*50)
    print(f"📊 SUMMARY")
    print(f"="*50)
    print(f"   Total sent: {sent_count}")
    print(f"   Total failed: {failed_count}")


if __name__ == "__main__":
    print("""
    🔔 FCM Notification Sender - Debug Mode
    
    Usage:
    1. Get FCM token from Flutter app:
       flutter logs | grep "FCM Token"
       
    2. Copy the token and paste below
    
    3. Run this script:
       python SEND_NOTIFICATION_EXAMPLE.py
    """)
    
    # PASTE YOUR FCM TOKEN HERE
    FCM_TOKEN = input("\nEnter FCM token from Flutter app: ").strip()
    
    if not FCM_TOKEN:
        print("❌ No token provided!")
        exit(1)
    
    if len(FCM_TOKEN) < 100:
        print("⚠️  Warning: Token seems too short. Make sure you copied the full token.")
    
    # Send test notification
    send_test_notification(FCM_TOKEN)
    
    print("\n" + "="*50)
    print("✅ DONE! Check your phone and Flutter logs")
    print("="*50)
