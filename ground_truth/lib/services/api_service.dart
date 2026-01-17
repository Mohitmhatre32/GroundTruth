import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../utils/constants.dart';

class ApiService {
  late final Dio _dio;
  final _secureStorage = const FlutterSecureStorage();

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        receiveTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        contentType: Headers.jsonContentType,
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onResponse: _onResponse,
        onError: _onError,
      ),
    );
  }

  Future<void> _onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _secureStorage.read(key: AppConstants.tokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  Future<void> _onResponse(Response response, ResponseInterceptorHandler handler) async {
    return handler.next(response);
  }

  Future<void> _onError(DioException error, ErrorInterceptorHandler handler) async {
    if (error.response?.statusCode == 401) {
      // Token expired, try to refresh
      try {
        await _refreshToken();
        return handler.resolve(await _dio.request(error.requestOptions.path));
      } catch (e) {
        // Refresh failed, logout user
        await logout();
        return handler.next(error);
      }
    }
    return handler.next(error);
  }

  // Auth Endpoints
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login/',
        data: {'email': email, 'password': password},
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        await _saveTokens(data);
        return data;
      }
      throw Exception('Login failed');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> register(
    String email,
    String password,
    String? name,
    String? phoneNumber,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register/',
        data: {
          'email': email,
          'password': password,
          'name': name,
          'phone_number': phoneNumber,
        },
      );
      
      if (response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        await _saveTokens(data);
        return data;
      }
      throw Exception('Registration failed');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    await _secureStorage.delete(key: AppConstants.tokenKey);
    await _secureStorage.delete(key: AppConstants.refreshTokenKey);
  }

  Future<void> _refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) throw Exception('No refresh token');

      final response = await _dio.post(
        '/auth/refresh/',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        await _secureStorage.write(
          key: AppConstants.tokenKey,
          value: data['access'],
        );
      }
    } catch (e) {
      await logout();
      rethrow;
    }
  }

  Future<void> _saveTokens(Map<String, dynamic> data) async {
    if (data['access'] != null) {
      await _secureStorage.write(
        key: AppConstants.tokenKey,
        value: data['access'],
      );
    }
    if (data['refresh'] != null) {
      await _secureStorage.write(
        key: AppConstants.refreshTokenKey,
        value: data['refresh'],
      );
    }
    if (data['user_id'] != null) {
      await _secureStorage.write(
        key: AppConstants.userIdKey,
        value: data['user_id'].toString(),
      );
    }
  }

  // Notification Endpoints
  Future<Map<String, dynamic>> registerDevice(String token, String platform) async {
    try {
      final response = await _dio.post(
        '/notify/register-device/',
        data: {'token': token, 'platform': platform},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getAlerts({
    String? lastId,
    String? area,
    int limit = 20,
  }) async {
    // Mocking Alerts for Demo
    await Future.delayed(const Duration(seconds: 1));
    return {
      'results': [
        {
          'id': '1',
          'title': 'Critical Water Level',
          'message': 'Water level in Ludhiana zone has dropped below 30m.',
          'severity': 'CRITICAL',
          'timestamp': DateTime.now().toIso8601String(),
          'is_read': false,
        },
        {
          'id': '2',
          'title': 'Rainfall Forecast',
          'message': 'Heavy rainfall expected in next 48 hours. Opportunity for harvesting.',
          'severity': 'MEDIUM',
          'timestamp': DateTime.now().subtract(const Duration(hours: 5)).toIso8601String(),
          'is_read': true,
        },
      ]
    };

    /* 
    // Real API Call
    try {
      final response = await _dio.get(
        '/notify/alerts/',
        queryParameters: {
          if (lastId != null) 'last_id': lastId,
          if (area != null) 'area': area,
          'limit': limit,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
    */
  }

  // Analysis Endpoints
  // Mobile API - Screen 1: Dashboard & Screen 3: Map
    Future<List<Map<String, dynamic>>> getStations() async {
    try {
      final response = await _dio.get('/mobile/stations');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      print("API Error: $e");
      // Fallback to mock if API fails for demo stability
      return [
        {
          "id": "STN_MOCK_1",
          "name": "Demo Station (Offline)",
          "latitude": 30.9010,
          "longitude": 75.8573,
          "current_depth_m": 25.0,
          "status": "Semi-Critical",
          "region": "North India"
        }
      ];
    }
  }



  // Helper Methods
  Future<bool> checkInternet() async {
    final connectivityResult = await (Connectivity().checkConnectivity());
    return connectivityResult != ConnectivityResult.none;
  }

  String _handleError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return AppConstants.networkError;
    } else if (error.response?.statusCode == 401) {
      return AppConstants.unauthorizedError;
    } else if (error.response?.statusCode == 500) {
      return AppConstants.serverError;
    } else {
      return error.message ?? AppConstants.serverError;
    }
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: AppConstants.tokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }
}
