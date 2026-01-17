import 'package:flutter/material.dart';
import '../models/alert.dart';
import '../services/alert_polling_service.dart';

class AlertProvider extends ChangeNotifier {
  final AlertPollingService pollingService;
  
  List<Alert> _alerts = [];
  List<Alert> _filteredAlerts = [];
  bool _isLoading = false;
  String? _error;
  String? _selectedSeverityFilter;
  bool _isAcknowledgedFilter = false;

  AlertProvider({required this.pollingService}) {
    _initializeStream();
  }

  List<Alert> get alerts => _filteredAlerts;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get selectedSeverityFilter => _selectedSeverityFilter;
  bool get isAcknowledgedFilter => _isAcknowledgedFilter;

  int get unreadAlertCount => _alerts.where((a) => !a.isAcknowledged).length;
  int get criticalAlertCount => _alerts.where((a) => a.isCritical && !a.isAcknowledged).length;

  void _initializeStream() {
    _isLoading = true;
    notifyListeners();

    pollingService.alertsStream.listen(
      (alerts) {
        _alerts = alerts;
        _applyFilters();
        _isLoading = false;
        _error = null;
        notifyListeners();
      },
      onError: (error) {
        _error = error.toString();
        _isLoading = false;
        notifyListeners();
      },
    );

    pollingService.startPolling();
  }

  void _applyFilters() {
    _filteredAlerts = _alerts.where((alert) {
      bool matchesSeverity = _selectedSeverityFilter == null || 
          alert.severity == _selectedSeverityFilter;
      bool matchesAcknowledged = !_isAcknowledgedFilter || 
          !alert.isAcknowledged;
      return matchesSeverity && matchesAcknowledged;
    }).toList();

    _filteredAlerts.sort((a, b) => b.severityIndex.compareTo(a.severityIndex));
  }

  void filterBySeverity(String? severity) {
    _selectedSeverityFilter = severity;
    _applyFilters();
    notifyListeners();
  }

  void toggleAcknowledgedFilter() {
    _isAcknowledgedFilter = !_isAcknowledgedFilter;
    _applyFilters();
    notifyListeners();
  }

  void clearFilters() {
    _selectedSeverityFilter = null;
    _isAcknowledgedFilter = false;
    _applyFilters();
    notifyListeners();
  }

  void acknowledge(String alertId) {
    final index = _alerts.indexWhere((a) => a.alertId == alertId);
    if (index != -1) {
      // Update in memory (in real app, would call API)
      _applyFilters();
      notifyListeners();
    }
  }

  @override
  void dispose() {
    pollingService.dispose();
    super.dispose();
  }
}
