# 🔍 Complete Notification Debugging Guide

## Flutter App Debug Messages

### 1. FCM Service Initialization (`fcm_service.dart`)

**Command to watch logs:**
```bash
flutter logs | grep -E "🔔|📱|✅|❌|📬|💾|🔄"
```

**Expected Success Flow:**
```
🔔 Initializing FCM Service...
📱 User notification permission status: AuthorizationStatus.authorized
📱 Local notification channels created
✅ Initial FCM Token: eXaMpLe_ToKeN_HeRe...
💾 Token saved to secure storage
✅ FCM Token sent to backend successfully
📦 Response: {status: success, device_id: xyz}
✨ FCM Service initialized successfully
```

**Possible Errors:**
```
❌ FCM Initialization Error: <error_message>
❌ Dio Error sending token: <dio_error>
📍 Error type: DioExceptionType.connectionTimeout
🔴 Response status: 500
🔴 Response data: <backend_error>
⚠️ Could not get device ID: <error>
⚠️ Failed to send token. Status: 404
```

### 2. Message Reception (`fcm_service.dart`)

**Background Messages (app closed):**
```
📬 Background Message Received!
Title: Critical Water Level Alert
Body: Water level dropped to 12.5m
Data: {severity: CRITICAL, alert_id: alert_123, ...}
```

**Foreground Messages (app open):**
```
📬 Foreground Message Received!
Title: Critical Water Level Alert
Body: Water level dropped to 12.5m
Data: {severity: CRITICAL, alert_id: alert_123, ...}
```

**Notification Tapped:**
```
🔔 Notification tapped!
Payload: {"severity":"CRITICAL","alert_id":"alert_123"}
Data: {severity: CRITICAL, alert_id: alert_123, ...}
```

**App Opened from Notification:**
```
📬 App opened from notification!
Data: {severity: CRITICAL, alert_id: alert_123, ...}
```

### 3. Alert Provider (`alert_provider.dart`)

**Command:**
```bash
flutter logs | grep -E "Alert|🔔"
```

**Expected Messages:**
```
# When new alerts detected
New alerts detected: 2
🔔 Alert notification sound triggered

# Alert count updates
Unread alert count: 5
Critical alert count: 2
```

### 4. Alert Notification Service (`alert_notification_service.dart`)

**Sound Trigger:**
```
🔔 Alert notification sound triggered
```

**Error:**
```
Sound playback error: <error_message>
```

---

## Backend Debug Messages

### 1. Alert Creation (`app_backend/features/alerts/service.py`)

**Command:**
```bash
python app_backend/main.py | grep -E "⚠️|ALERT"
```

**Success:**
```python
⚠️ ALERT TRIGGERED: Ludhiana North - CRITICAL
```

**Expected in Firestore:**
```json
{
  "alert_id": "STN_001_1737178432",
  "station_id": "STN_001",
  "location": "Ludhiana North",
  "water_level": 12.5,
  "message": "CRITICAL: Water level dropped to 12.5m in Ludhiana North!",
  "timestamp": "2026-01-18T04:30:32.123456Z",
  "type": "CRITICAL",
  "is_read": false
}
```

### 2. FCM Token Registration (`app_backend/features/mobile_notifications/router.py`)

**Add this debug logging:**

```python
# In router.py update_reading or register-device endpoint
@router.post("/register-device/")
async def register_device(device: DeviceRegistration):
    print(f"📱 Device Registration Request:")
    print(f"   Token: {device.token[:20]}...")
    print(f"   Device Type: {device.device_type}")
    print(f"   Device ID: {device.device_id}")
    
    try:
        # Save to database
        result = save_device_token(device)
        print(f"✅ Device registered successfully: {device.device_id}")
        return {"status": "success", "device_id": device.device_id}
    except Exception as e:
        print(f"❌ Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 3. Sending FCM Notifications (Backend)

**Add to backend where you send FCM:**

```python
from firebase_admin import messaging

def send_fcm_notification(token: str, alert_data: dict):
    print(f"\n📤 Sending FCM Notification:")
    print(f"   To Token: {token[:20]}...")
    print(f"   Title: {alert_data['title']}")
    print(f"   Severity: {alert_data['severity']}")
    
    message = messaging.Message(
        notification=messaging.Notification(
            title=alert_data['title'],
            body=alert_data['message'],
        ),
        data={
            'severity': alert_data['severity'],
            'alert_id': alert_data['id'],
            'station_id': alert_data['station_id'],
            'type': 'alert',
        },
        token=token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                channel_id='alert_channel',
                priority='max' if alert_data['severity'] == 'CRITICAL' else 'high',
            ),
        ),
    )
    
    try:
        response = messaging.send(message)
        print(f"✅ FCM sent successfully: {response}")
        return response
    except Exception as e:
        print(f"❌ FCM send failed: {str(e)}")
        raise
```

---

## Complete Debug Flow

### End-to-End Notification Test

**Step 1: Check App Initialization**
```bash
flutter logs | head -50
```
Look for:
- ✅ FCM Service initialized
- ✅ FCM Token sent to backend
- 📱 Local notification channels created

**Step 2: Check Backend Token Storage**
```bash
# In backend logs
📱 Device Registration Request
✅ Device registered successfully
```

**Step 3: Trigger Alert from Backend**
```bash
# Backend creates alert
⚠️ ALERT TRIGGERED: Location - CRITICAL

# Backend sends FCM
📤 Sending FCM Notification
✅ FCM sent successfully: projects/.../messages/...
```

**Step 4: Check Flutter Reception**

**If app is open (foreground):**
```bash
flutter logs | grep "Foreground"
```
Expected:
```
📬 Foreground Message Received!
Title: Critical Alert
```

**If app is closed (background):**
```bash
flutter logs | grep "Background"
```
Expected:
```
📬 Background Message Received!
Title: Critical Alert
```

**Step 5: Check Notification Display**
- Visual: Notification appears in Android notification tray
- Sound: Notification sound plays (if enabled)
- Badge: App icon shows badge count

**Step 6: Check Tap Handling**
```bash
flutter logs | grep "tapped"
```
Expected:
```
🔔 Notification tapped!
Payload: {...}
```

---

## Debugging Commands Cheat Sheet

### Flutter App

```bash
# Watch all FCM logs
flutter logs | grep -E "FCM|🔔|📬|notification"

# Watch only errors
flutter logs | grep "❌"

# Watch token registration
flutter logs | grep "Token"

# Watch message reception
flutter logs | grep "Message Received"

# Full verbose output
flutter run --verbose
```

### Backend

```bash
# Watch all alert logs
tail -f backend.log | grep -E "ALERT|FCM|📤|✅|❌"

# Watch FCM sends
tail -f backend.log | grep "FCM"

# Watch device registrations
tail -f backend.log | grep "Device"
```

### Firebase Console

1. **Cloud Messaging Dashboard:**
   - Shows sent message count
   - Success/failure rates

2. **Send Test Message:**
   - Click "Send test message"
   - Paste FCM token from logs
   - Check if notification appears

---

## Common Issues & Debug Output

### Issue: No FCM Token Generated

**Debug Output:**
```
❌ FCM Initialization Error: Default FirebaseApp is not initialized
```

**Solution:** Add `google-services.json`

---

### Issue: Token Not Sent to Backend

**Debug Output:**
```
❌ Dio Error sending token: Connection refused
📍 Error type: DioExceptionType.connectionError
```

**Solution:** 
- Check backend is running
- Verify API URL in `fcm_service.dart`

---

### Issue: Notification Not Showing (Foreground)

**Debug Output:**
```
📬 Foreground Message Received!
# But no visual notification
```

**Check:**
```bash
flutter logs | grep "Local notification"
```

Should see:
```
📱 Local notification channels created
```

---

### Issue: Backend Can't Send FCM

**Debug Output:**
```
❌ FCM send failed: App instance has been revoked
```

**Solution:** Check service account key is valid

**Debug Output:**
```
❌ FCM send failed: Requested entity was not found
```

**Solution:** Token is invalid or expired, app needs to re-register

---

## Enable Maximum Verbosity

### Flutter

**In `main.dart`:**
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Enable Firebase debug logging
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Set log level
  FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );
  
  runApp(const GroundTruthApp());
}
```

### Backend

**In Python:**
```python
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Firebase Admin SDK logging
logging.getLogger('firebase_admin').setLevel(logging.DEBUG)
```

---

## Testing Checklist

- [ ] FCM token generated and logged
- [ ] Token sent to backend successfully
- [ ] Backend confirms token storage
- [ ] Alert created in backend logs
- [ ] FCM message sent from backend
- [ ] Message received in Flutter (foreground OR background)
- [ ] Local notification displayed
- [ ] Notification sound plays
- [ ] Tapping notification opens app
- [ ] Badge count updates

---

## Quick Diagnostic

Run this to see entire notification flow:

**Terminal 1 (Flutter):**
```bash
flutter logs | grep -E "🔔|📬|✅|❌"
```

**Terminal 2 (Backend):**
```bash
python main.py 2>&1 | grep -E "ALERT|FCM|Device"
```

**Terminal 3 (Send Test Alert):**
```bash
curl -X POST http://localhost:8000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "STN_001",
    "location_name": "Test Location",
    "water_level": 10.5
  }'
```

Watch all three terminals for the complete flow! 🎯
