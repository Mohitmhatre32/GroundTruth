import 'package:flutter/material.dart';
import '../models/station.dart';

class StationProvider extends ChangeNotifier {
  List<Station> _stations = [];
  List<Station> _filteredStations = [];
  bool _isLoading = false;
  String? _error;
  String? _selectedZoneFilter;

  List<Station> get stations => _filteredStations;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get selectedZoneFilter => _selectedZoneFilter;

  int get criticalCount => _stations.where((s) => s.isCritical).length;
  int get warningCount => _stations.where((s) => s.isWarning).length;
  int get safeCount => _stations.where((s) => s.isSafe).length;

  void setStations(List<Station> stations) {
    _stations = stations;
    _applyFilters();
    _isLoading = false;
    _error = null;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void _applyFilters() {
    if (_selectedZoneFilter == null) {
      _filteredStations = _stations;
    } else {
      _filteredStations = _stations
          .where((station) => station.zone == _selectedZoneFilter)
          .toList();
    }

    // Sort by zone (critical first)
    _filteredStations.sort((a, b) {
      final zoneOrder = {'CRITICAL': 0, 'SEMI_CRITICAL': 1, 'SAFE': 2};
      return (zoneOrder[a.zone] ?? 3).compareTo(zoneOrder[b.zone] ?? 3);
    });
  }

  void filterByZone(String? zone) {
    _selectedZoneFilter = zone;
    _applyFilters();
    notifyListeners();
  }

  void clearFilters() {
    _selectedZoneFilter = null;
    _applyFilters();
    notifyListeners();
  }

  Station? getStationById(String id) {
    try {
      return _stations.firstWhere((s) => s.stationId == id);
    } catch (e) {
      return null;
    }
  }

  List<Station> getCriticalStations() {
    return _stations.where((s) => s.isCritical).toList();
  }

  List<Station> getWarningStations() {
    return _stations.where((s) => s.isWarning).toList();
  }

  List<Station> getSafeStations() {
    return _stations.where((s) => s.isSafe).toList();
  }
}
