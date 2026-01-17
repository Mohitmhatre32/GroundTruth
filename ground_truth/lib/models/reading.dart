import 'package:intl/intl.dart';

class Reading {
  final String readingId;
  final String stationId;
  final double waterLevel;
  final DateTime timestamp;
  final String dataSource; // SENSOR or MANUAL
  final String? photoUrl;
  final String? notes;

  Reading({
    required this.readingId,
    required this.stationId,
    required this.waterLevel,
    required this.timestamp,
    required this.dataSource,
    this.photoUrl,
    this.notes,
  });

  factory Reading.fromJson(Map<String, dynamic> json) {
    return Reading(
      readingId: json['id'] ?? '',
      stationId: json['station_id'] ?? '',
      waterLevel: (json['water_level'] as num?)?.toDouble() ?? 0.0,
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      dataSource: json['data_source'] ?? 'SENSOR',
      photoUrl: json['photo_url'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': readingId,
      'station_id': stationId,
      'water_level': waterLevel,
      'timestamp': timestamp.toIso8601String(),
      'data_source': dataSource,
      'photo_url': photoUrl,
      'notes': notes,
    };
  }

  String get formattedLevel => '${waterLevel.toStringAsFixed(2)}m';
  String get formattedTime => DateFormat('MMM dd, HH:mm').format(timestamp);
  bool get isManual => dataSource == 'MANUAL';
}
