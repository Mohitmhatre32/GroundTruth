import 'dart:async';
import 'api_service.dart';
import '../models/alert.dart';
import '../utils/constants.dart';

class AlertPollingService {
  final ApiService apiService;
  Timer? _pollTimer;
  String _lastAlertId = '';
  final _alertsStreamController = StreamController<List<Alert>>.broadcast();

  AlertPollingService({required this.apiService});

  Stream<List<Alert>> get alertsStream => _alertsStreamController.stream;

  void startPolling({String? area}) {
    stopPolling(); // Stop any existing polling
    
    _pollTimer = Timer.periodic(AppConstants.alertPollingInterval, (_) async {
      try {
        final response = await apiService.getAlerts(
          lastId: _lastAlertId.isEmpty ? null : _lastAlertId,
          area: area,
        );

        final alertsData = response['alerts'] as List? ?? [];
        final alerts = alertsData
            .map((alert) => Alert.fromJson(alert as Map<String, dynamic>))
            .toList();

        if (alerts.isNotEmpty) {
          _lastAlertId = alerts.last.alertId;
          _alertsStreamController.add(alerts);
        }
      } catch (e) {
        // Handle error silently, continue polling
        print('Polling error: $e');
      }
    });

    // Fetch initial alerts immediately
    _fetchAlerts(area);
  }

  Future<void> _fetchAlerts(String? area) async {
    try {
      final response = await apiService.getAlerts(area: area, limit: 50);
      final alertsData = response['alerts'] as List? ?? [];
      final alerts = alertsData
          .map((alert) => Alert.fromJson(alert as Map<String, dynamic>))
          .toList();

      if (alerts.isNotEmpty) {
        _lastAlertId = alerts.last.alertId;
        _alertsStreamController.add(alerts);
      }
    } catch (e) {
      print('Failed to fetch alerts: $e');
    }
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  void dispose() {
    stopPolling();
    _alertsStreamController.close();
  }
}
