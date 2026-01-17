import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../models/station.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();

  factory LocationService() {
    return _instance;
  }

  LocationService._internal();

  StreamSubscription<Position>? _positionStream;
  final _positionStreamController = StreamController<Position>.broadcast();
  final _nearestStationController = StreamController<Station?>.broadcast();

  Stream<Position> get positionStream => _positionStreamController.stream;
  Stream<Station?> get nearestStationStream => _nearestStationController.stream;

  Position? _currentPosition;

  Future<bool> requestLocationPermission() async {
    final permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      final result = await Geolocator.requestPermission();
      return result != LocationPermission.denied && result != LocationPermission.deniedForever;
    } else if (permission == LocationPermission.deniedForever) {
      await Geolocator.openLocationSettings();
      return false;
    }
    return true;
  }

  Future<Position?> getCurrentLocation() async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      _currentPosition = position;
      _positionStreamController.add(position);
      return position;
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  void startLocationTracking() async {
    try {
      final hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      _positionStream = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10, // meters
          timeLimit: Duration(seconds: 10),
        ),
      ).listen((Position position) {
        _currentPosition = position;
        _positionStreamController.add(position);
      });
    } catch (e) {
      print('Error starting location tracking: $e');
    }
  }

  void stopLocationTracking() {
    _positionStream?.cancel();
    _positionStream = null;
  }

  Position? get currentPosition => _currentPosition;

  double? calculateDistance(Station station) {
    if (_currentPosition == null) return null;
    return Geolocator.distanceBetween(
      _currentPosition!.latitude,
      _currentPosition!.longitude,
      station.latitude,
      station.longitude,
    );
  }

  Station? findNearestStation(List<Station> stations) {
    if (_currentPosition == null || stations.isEmpty) return null;

    Station? nearest;
    double minDistance = double.infinity;

    for (final station in stations) {
      final distance = Geolocator.distanceBetween(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
        station.latitude,
        station.longitude,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = station;
      }
    }

    return nearest;
  }

  void dispose() {
    stopLocationTracking();
    _positionStreamController.close();
    _nearestStationController.close();
  }
}
