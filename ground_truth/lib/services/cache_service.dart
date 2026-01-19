import 'dart:convert';
import 'package:hive/hive.dart';
import 'dart:async';

class CacheService {
  static final CacheService _instance = CacheService._internal();
  late Box<String> _cacheBox;
  bool _initialized = false;

  factory CacheService() => _instance;
  CacheService._internal();

  Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      _cacheBox = await Hive.openBox<String>('groundtruth_cache');
      _initialized = true;
      print('✅ Cache Service Initialized');
    } catch (e) {
      print('❌ Cache Service Init Error: $e');
    }
  }

  // Cache Keys
  static const String _stationsKey = 'cached_stations';
  static const String _nearestStationKey = 'cached_nearest_station';
  static const String _userLocationKey = 'cached_user_location';
  static const String _timestampPrefix = 'timestamp_';
  static const int _cacheExpiryMinutes = 30; // Cache expires after 30 minutes

  /// Save stations data to cache
  Future<void> saveStations(List<Map<String, dynamic>> stations) async {
    if (!_initialized) await initialize();
    try {
      await _cacheBox.put(_stationsKey, jsonEncode(stations));
      await _cacheBox.put('${_timestampPrefix}stations', DateTime.now().toIso8601String());
      print('📦 Stations cached (${stations.length} items)');
    } catch (e) {
      print('⚠️ Error caching stations: $e');
    }
  }

  /// Get cached stations data
  Future<List<Map<String, dynamic>>?> getStations() async {
    if (!_initialized) await initialize();
    try {
      if (!_isCacheValid('stations')) {
        await clearStations();
        return null;
      }
      
      final cached = _cacheBox.get(_stationsKey);
      if (cached != null) {
        final decoded = jsonDecode(cached) as List;
        print('✅ Retrieved ${decoded.length} stations from cache');
        return List<Map<String, dynamic>>.from(
          decoded.map((item) => Map<String, dynamic>.from(item as Map))
        );
      }
      return null;
    } catch (e) {
      print('⚠️ Error retrieving cached stations: $e');
      return null;
    }
  }

  /// Save nearest station to cache
  Future<void> saveNearestStation(Map<String, dynamic> station) async {
    if (!_initialized) await initialize();
    try {
      await _cacheBox.put(_nearestStationKey, jsonEncode(station));
      await _cacheBox.put('${_timestampPrefix}nearest_station', DateTime.now().toIso8601String());
      print('📍 Nearest station cached');
    } catch (e) {
      print('⚠️ Error caching nearest station: $e');
    }
  }

  /// Get cached nearest station
  Future<Map<String, dynamic>?> getNearestStation() async {
    if (!_initialized) await initialize();
    try {
      if (!_isCacheValid('nearest_station')) {
        await clearNearestStation();
        return null;
      }
      
      final cached = _cacheBox.get(_nearestStationKey);
      if (cached != null) {
        print('✅ Retrieved nearest station from cache');
        return jsonDecode(cached) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      print('⚠️ Error retrieving cached nearest station: $e');
      return null;
    }
  }

  /// Save user location to cache
  Future<void> saveUserLocation(double latitude, double longitude) async {
    if (!_initialized) await initialize();
    try {
      final location = {
        'latitude': latitude,
        'longitude': longitude,
      };
      await _cacheBox.put(_userLocationKey, jsonEncode(location));
      await _cacheBox.put('${_timestampPrefix}user_location', DateTime.now().toIso8601String());
      print('📍 User location cached');
    } catch (e) {
      print('⚠️ Error caching user location: $e');
    }
  }

  /// Get cached user location
  Future<Map<String, double>?> getUserLocation() async {
    if (!_initialized) await initialize();
    try {
      if (!_isCacheValid('user_location')) {
        await clearUserLocation();
        return null;
      }
      
      final cached = _cacheBox.get(_userLocationKey);
      if (cached != null) {
        final decoded = jsonDecode(cached) as Map<String, dynamic>;
        print('✅ Retrieved user location from cache');
        return {
          'latitude': (decoded['latitude'] as num).toDouble(),
          'longitude': (decoded['longitude'] as num).toDouble(),
        };
      }
      return null;
    } catch (e) {
      print('⚠️ Error retrieving cached user location: $e');
      return null;
    }
  }

  /// Check if cache entry is still valid
  bool _isCacheValid(String key) {
    try {
      final timestamp = _cacheBox.get('${_timestampPrefix}$key');
      if (timestamp == null) return false;
      
      final cachedTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(cachedTime).inMinutes;
      
      final isValid = difference < _cacheExpiryMinutes;
      if (!isValid) {
        print('⏰ Cache for "$key" expired (${difference}m old)');
      }
      return isValid;
    } catch (e) {
      print('⚠️ Error validating cache: $e');
      return false;
    }
  }

  /// Clear individual cache entries
  Future<void> clearStations() async {
    if (!_initialized) await initialize();
    await _cacheBox.delete(_stationsKey);
    await _cacheBox.delete('${_timestampPrefix}stations');
  }

  Future<void> clearNearestStation() async {
    if (!_initialized) await initialize();
    await _cacheBox.delete(_nearestStationKey);
    await _cacheBox.delete('${_timestampPrefix}nearest_station');
  }

  Future<void> clearUserLocation() async {
    if (!_initialized) await initialize();
    await _cacheBox.delete(_userLocationKey);
    await _cacheBox.delete('${_timestampPrefix}user_location');
  }

  /// Clear all cache
  Future<void> clearAll() async {
    if (!_initialized) await initialize();
    try {
      await _cacheBox.clear();
      print('🗑️ All cache cleared');
    } catch (e) {
      print('⚠️ Error clearing cache: $e');
    }
  }

  /// Get cache statistics
  Future<Map<String, dynamic>> getCacheStats() async {
    if (!_initialized) await initialize();
    try {
      return {
        'total_items': _cacheBox.length,
        'stations_cached': _cacheBox.containsKey(_stationsKey),
        'nearest_station_cached': _cacheBox.containsKey(_nearestStationKey),
        'user_location_cached': _cacheBox.containsKey(_userLocationKey),
      };
    } catch (e) {
      return {'error': e.toString()};
    }
  }
}
