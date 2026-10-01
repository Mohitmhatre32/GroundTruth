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
    // Handle both new and old API formats
    final String id = json['alert_id'] ?? json['id'] ?? '';
    final String type = json['type'] ?? json['severity'] ?? 'MEDIUM';
    final bool isRead = json['is_read'] ?? json['acknowledged'] ?? false;
    final String msg = json['message'] ?? json['description'] ?? '';
    
    // Generate title from message if not provided
    String generatedTitle = json['title'] ?? '';
    if (generatedTitle.isEmpty && msg.isNotEmpty) {
      // Extract first sentence or first 50 chars as title
      final firstSentence = msg.split('.').first;
      generatedTitle = firstSentence.length > 50 
        ? firstSentence.substring(0, 50) + '...' 
        : firstSentence;
    }
    
    // Parse location - can be string or object
    Map<String, dynamic>? locationMap;
    if (json['location'] is String) {
      locationMap = {'name': json['location']};
    } else if (json['location'] is Map) {
      locationMap = json['location'] as Map<String, dynamic>;
    }
    
    return Alert(
      alertId: id,
      stationId: json['station_id'] ?? '',
      severity: type.toUpperCase(),
      title: generatedTitle,
      message: msg,
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      isAcknowledged: isRead,
      acknowledgedBy: json['acknowledged_by'],
      dwlrValue: (json['water_level'] as num?)?.toDouble() ?? (json['dwlr_value'] as num?)?.toDouble(),
      location: locationMap,
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
    final severityUpper = severity.toUpperCase().trim();
    switch (severityUpper) {
      case 'CRITICAL':
        return 3;
      case 'HIGH':
        return 2;
      case 'MEDIUM':
        return 1;
      case 'LOW':
      default:
        return 0;
    }
  }
}
