import 'package:intl/intl.dart';

class Station {
  final String stationId;
  final String name;
  final double latitude;
  final double longitude;
  final double currentLevel;
  final double warningLevel;
  final double criticalLevel;
  final String zone; // SAFE, SEMI_CRITICAL, CRITICAL
  final DateTime lastUpdated;
  final bool isActive;

  Station({
    required this.stationId,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.currentLevel,
    required this.warningLevel,
    required this.criticalLevel,
    required this.zone,
    required this.lastUpdated,
    this.isActive = true,
  });

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      stationId: json['id'] ?? '',
      name: json['name'] ?? '',
      latitude: (json['location']['lat'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['location']['lng'] as num?)?.toDouble() ?? 0.0,
      currentLevel: (json['current_level'] as num?)?.toDouble() ?? 0.0,
      warningLevel: (json['warning_level'] as num?)?.toDouble() ?? 2.5,
      criticalLevel: (json['critical_level'] as num?)?.toDouble() ?? 5.0,
      zone: json['zone'] ?? 'SAFE',
      lastUpdated: DateTime.parse(json['last_updated'] ?? DateTime.now().toIso8601String()),
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': stationId,
      'name': name,
      'location': {'lat': latitude, 'lng': longitude},
      'current_level': currentLevel,
      'warning_level': warningLevel,
      'critical_level': criticalLevel,
      'zone': zone,
      'last_updated': lastUpdated.toIso8601String(),
      'is_active': isActive,
    };
  }

  String get formattedLevel => '${currentLevel.toStringAsFixed(2)}m';
  String get formattedTime => DateFormat('HH:mm').format(lastUpdated);
  bool get isCritical => currentLevel > criticalLevel;
  bool get isWarning => currentLevel > warningLevel && currentLevel <= criticalLevel;
  bool get isSafe => currentLevel <= warningLevel;
}
