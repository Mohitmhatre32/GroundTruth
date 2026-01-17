import 'package:intl/intl.dart';

class Alert {
  final String alertId;
  final String stationId;
  final String severity; // LOW, MEDIUM, HIGH, CRITICAL
  final String title;
  final String message;
  final DateTime timestamp;
  final bool isAcknowledged;
  final String? acknowledgedBy;
  final double? dwlrValue;
  final Map<String, dynamic>? location;

  Alert({
    required this.alertId,
    required this.stationId,
    required this.severity,
    required this.title,
    required this.message,
    required this.timestamp,
    this.isAcknowledged = false,
    this.acknowledgedBy,
    this.dwlrValue,
    this.location,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      alertId: json['id'] ?? '',
      stationId: json['station_id'] ?? '',
      severity: json['severity'] ?? 'MEDIUM',
      title: json['title'] ?? '',
      message: json['description'] ?? json['message'] ?? '',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      isAcknowledged: json['acknowledged'] ?? false,
      acknowledgedBy: json['acknowledged_by'],
      dwlrValue: (json['dwlr_value'] as num?)?.toDouble(),
      location: json['location'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': alertId,
      'station_id': stationId,
      'severity': severity,
      'title': title,
      'description': message,
      'timestamp': timestamp.toIso8601String(),
      'acknowledged': isAcknowledged,
      'acknowledged_by': acknowledgedBy,
      'dwlr_value': dwlrValue,
      'location': location,
    };
  }

  String get formattedTime => DateFormat('MMM dd, HH:mm').format(timestamp);
  bool get isCritical => severity == 'CRITICAL';
  bool get isHigh => severity == 'HIGH';
  bool get isMedium => severity == 'MEDIUM';
  bool get isLow => severity == 'LOW';

  int get severityIndex {
    switch (severity) {
      case 'CRITICAL':
        return 3;
      case 'HIGH':
        return 2;
      case 'MEDIUM':
        return 1;
      default:
        return 0;
    }
  }
}
