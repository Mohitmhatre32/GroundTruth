import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:convert';

// Top-level function for background message handling
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print("📬 Background Message Received!");
  print("Title: ${message.notification?.title}");
  print("Body: ${message.notification?.body}");
  print("Data: ${message.data}");
}

class FCMService {
  static final FCMService _instance = FCMService._internal();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  late Dio _dio;
  late DeviceInfoPlugin _deviceInfo;

  factory FCMService() {
    return _instance;
  }

  FCMService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:8000/api', // Android emulator localhost
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
    _deviceInfo = DeviceInfoPlugin();
  }

  /// Initialize FCM service and start listening for token refreshes
  Future<void> initialize() async {
    try {
      print("🔔 Initializing FCM Service...");

      // Set up background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Request notification permissions
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      print("📱 User notification permission status: ${settings.authorizationStatus}");

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Get initial token
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        print("✅ Initial FCM Token: $token");
        await _sendTokenToBackend(token);
      }

      // Listen to token refresh events
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        print("🔄 New FCM Token Received: $newToken");
        _sendTokenToBackend(newToken);
      });

      // Set up foreground message handler
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle notification taps when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

      // Check if app was opened from a notification
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        _handleMessageOpenedApp(initialMessage);
      }

      print("✨ FCM Service initialized successfully");
    } catch (e) {
      print("❌ FCM Initialization Error: $e");
    }
  }

  /// Initialize local notifications plugin
  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel for Android
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'alert_channel', // id
      'Alert Notifications', // name
      description: 'Critical water level and system alerts',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    print("📱 Local notification channels created");
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    print("📬 Foreground Message Received!");
    print("Title: ${message.notification?.title}");
    print("Body: ${message.notification?.body}");
    print("Data: ${message.data}");

    // Display notification even when app is in foreground
    _showLocalNotification(message);
  }

  /// Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final data = message.data;

    if (notification != null) {
      // Determine notification priority based on severity
      final severity = data['severity']?.toString().toUpperCase() ?? 'MEDIUM';
      final importance = severity == 'CRITICAL' ? Importance.max : Importance.high;
      final priority = severity == 'CRITICAL' ? Priority.max : Priority.high;

      final AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'alert_channel',
        'Alert Notifications',
        channelDescription: 'Critical water level and system alerts',
        importance: importance,
        priority: priority,
        playSound: true,
        enableVibration: true,
        icon: '@mipmap/ic_launcher',
        styleInformation: BigTextStyleInformation(
          notification.body ?? '',
          contentTitle: notification.title,
        ),
      );

      final NotificationDetails details = NotificationDetails(android: androidDetails);

      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        details,
        payload: jsonEncode(data),
      );
    }
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    print("🔔 Notification tapped!");
    print("Payload: ${response.payload}");
    
    if (response.payload != null) {
      try {
        final data = jsonDecode(response.payload!);
        print("Data: $data");
        // TODO: Navigate to appropriate screen based on notification data
      } catch (e) {
        print("Error parsing notification payload: $e");
      }
    }
  }

  /// Handle app opened from notification
  void _handleMessageOpenedApp(RemoteMessage message) {
    print("📬 App opened from notification!");
    print("Data: ${message.data}");
    // TODO: Navigate to appropriate screen based on message data
  }

  /// Send token to backend using Dio API
  Future<void> _sendTokenToBackend(String token) async {
    try {
      // Save token locally first for offline access
      await _secureStorage.write(key: 'fcm_token', value: token);
      print("💾 Token saved to secure storage");

      // Get device information
      String deviceId = 'unknown';
      try {
        final androidInfo = await _deviceInfo.androidInfo;
        deviceId = androidInfo.id;
      } catch (e) {
        print("⚠️ Could not get device ID: $e");
      }

      // Send token to backend
      final response = await _dio.post(
        '/notify/register-device/',
        data: {
          'token': token,
          'device_type': 'android',
          'device_id': deviceId,
          'device_name': 'Flutter Mobile',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("✅ FCM Token sent to backend successfully");
        print("📦 Response: ${response.data}");
      } else {
        print("⚠️ Failed to send token. Status: ${response.statusCode}");
        print("📦 Response: ${response.data}");
      }
    } on DioException catch (e) {
      print("❌ Dio Error sending token: ${e.message}");
      print("📍 Error type: ${e.type}");
      if (e.response != null) {
        print("🔴 Response status: ${e.response?.statusCode}");
        print("🔴 Response data: ${e.response?.data}");
      }
    } catch (e) {
      print("❌ Unexpected error sending token to backend: $e");
    }
  }

  /// Retrieve stored FCM token from secure storage
  Future<String?> getStoredToken() async {
    try {
      return await _secureStorage.read(key: 'fcm_token');
    } catch (e) {
      print("❌ Error retrieving token from storage: $e");
      return null;
    }
  }

  /// Delete stored FCM token (useful for logout)
  Future<void> deleteStoredToken() async {
    try {
      await _secureStorage.delete(key: 'fcm_token');
      await _firebaseMessaging.deleteToken();
      print("✅ FCM Token deleted from storage and Firebase");
    } catch (e) {
      print("❌ Error deleting token: $e");
    }
  }

  /// Get the current FCM token
  Future<String?> getCurrentToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print("❌ Error getting current token: $e");
      return null;
    }
  }
}
