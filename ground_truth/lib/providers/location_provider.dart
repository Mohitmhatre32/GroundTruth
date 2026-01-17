import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/station.dart';
import '../services/location_service.dart';

class LocationProvider extends ChangeNotifier {
  final LocationService locationService;
  
  Position? _currentPosition;
  Station? _nearestStation;
  bool _isLoading = false;
  String? _error;
  bool _hasPermission = false;

  LocationProvider({required this.locationService}) {
    _initializeLocation();
  }

  Position? get currentPosition => _currentPosition;
  Station? get nearestStation => _nearestStation;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasPermission => _hasPermission;

  Future<void> _initializeLocation() async {
    _isLoading = true;
    notifyListeners();

    try {
      _hasPermission = await locationService.requestLocationPermission();
      if (_hasPermission) {
        final position = await locationService.getCurrentLocation();
        if (position != null) {
          _currentPosition = position;
          _error = null;
        }
      } else {
        _error = 'Location permission denied';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    locationService.positionStream.listen((position) {
      _currentPosition = position;
      notifyListeners();
    });
  }

  void updateNearestStation(Station? station) {
    _nearestStation = station;
    notifyListeners();
  }

  double? calculateDistance(Station station) {
    return locationService.calculateDistance(station);
  }

  Station? findNearest(List<Station> stations) {
    return locationService.findNearestStation(stations);
  }

  Future<void> refreshLocation() async {
    try {
      final position = await locationService.getCurrentLocation();
      if (position != null) {
        _currentPosition = position;
        _error = null;
      }
    } catch (e) {
      _error = e.toString();
    }
    notifyListeners();
  }

  @override
  void dispose() {
    locationService.dispose();
    super.dispose();
  }
}
