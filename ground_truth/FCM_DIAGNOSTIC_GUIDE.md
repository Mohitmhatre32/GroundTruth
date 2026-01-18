# 🚨 FCM Notifications Not Working - Diagnostic Guide

## Critical Issue Found

**Missing:** `google-services.json` file - This is **REQUIRED** for Firebase Cloud Messaging!

---

## Quick Fix Steps

### 1. Download google-services.json from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **GroundTruth** (or create new project if needed)
3. Click the **gear icon** ⚙️ → **Project Settings**
4. Scroll to "Your apps" section
5. Click on your Android app (or add one if none exists)
   - Package name: `com.example.ground_truth`
6. Click **"Download google-services.json"**
7. **Place it here:** `android/app/google-services.json`

### 2. Verify File Location

```
ground_truth/
└── android/
    └── app/
        ├── build.gradle.kts
        └── google-services.json  ← FILE MUST BE HERE
```

### 3. Rebuild the App

```bash
cd ground_truth
flutter clean
flutter pub get
flutter run
```

---

## Troubleshooting Checklist

### ✅ Configuration Files
- [ ] `google-services.json` exists in `android/app/`
- [ ] Google Services plugin added to `build.gradle.kts` ✅ (just added)
- [ ] Firebase initialized in `main.dart` ✅

### ✅ Permissions
- [ ] `POST_NOTIFICATIONS` permission in AndroidManifest.xml ✅
- [ ] User granted notification permission (check phone settings)

### ✅ App Running
- [ ] App is built and installed on phone
- [ ] Check logcat for FCM token:
   ```
   ✅ Initial FCM Token: <token_string>
   ```

### ✅ Testing

**Method 1: Firebase Console Test**
1. Firebase Console → Cloud Messaging
2. "Send test message"
3. Enter FCM token from logs
4. Send

**Method 2: Backend Test**
1. Ensure backend is running
2. Backend has valid service account key
3. Backend sends notification to registered token

---

## Common Errors & Solutions

### Error: "Default FirebaseApp is not initialized"
**Solution:** google-services.json is missing or incorrectly placed

### Error: "FirebaseMessaging: Failed to get token"
**Solution:** 
- Check internet connection
- Verify google-services.json is valid
- Rebuild app after adding file

### Error: "Notification permission denied"
**Solution:**
- Check phone Settings → Apps → GroundTruth → Notifications
- Enable all notification permissions

### Notifications work in foreground but not background
**Solution:** ✅ Already fixed - background handler added

### Token sent to backend but notifications still not showing
**Solution:**
- Verify backend is actually sending FCM messages
- Check backend logs for send confirmation
- Verify service account key is correct in backend

---

## Debug Commands

### Check if FCM token is registered:
```bash
# Watch app logs
flutter logs | grep "FCM"
```

**Expected output:**
```
🔔 Initializing FCM Service...
📱 User notification permission status: AuthorizationStatus.authorized
✅ Initial FCM Token: <your_token>
💾 Token saved to secure storage
✅ FCM Token sent to backend successfully
```

### Test notification from command line (if you have firebase-admin):
```python
from firebase_admin import messaging

message = messaging.Message(
    notification=messaging.Notification(
        title='Test Alert',
        body='This is a test notification',
    ),
    data={'severity': 'CRITICAL'},
    token='<YOUR_FCM_TOKEN>',
)

response = messaging.send(message)
print(f'Successfully sent: {response}')
```

---

## Next Steps

1. **Download `google-services.json`** from Firebase Console
2. **Place in `android/app/`**
3. **Run `flutter clean && flutter run`**
4. **Check logs** for FCM token
5. **Send test notification** from Firebase Console

Once `google-services.json` is added, notifications will work! 🎉

---

## Files Modified (to prepare for google-services.json)

1. ✅ `android/app/build.gradle.kts` - Added Google Services plugin
2. ✅ `android/build.gradle.kts` - Added classpath dependency
3. ⏳ `android/app/google-services.json` - **YOU NEED TO ADD THIS**

After adding google-services.json, FCM will be fully functional!
