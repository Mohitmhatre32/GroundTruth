import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import 'package:device_info_plus/device_info_plus.dart';

class FCMService {
  static final FCMService _instance = FCMService._internal();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
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

      // Request notification permissions
      NotificationSettings settings =
          await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      print("📱 User notification permission status: ${settings.authorizationStatus}");

      // Get initial token
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        print("✅ Initial FCM Token: $token");
        await _sendTokenToBackend(token);
      }

      // Listen to token refresh events - this will run in background while app is active
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        print("🔄 New FCM Token Received: $newToken");
        _sendTokenToBackend(newToken);
      });

      print("✨ FCM Service initialized successfully");
    } catch (e) {
      print("❌ FCM Initialization Error: $e");
    }
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
      print("✅ FCM Token deleted from storage");
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
