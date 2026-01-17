import 'package:intl/intl.dart';

class Verification {
  final String verificationId;
  final String stationId;
  final String userId;
  final double manualReading;
  final String? photoPath;
  final String? photoUrl;
  final String notes;
  final DateTime timestamp;
  final String syncStatus; // PENDING, SYNCED, FAILED
  final double? confidence;

  Verification({
    required this.verificationId,
    required this.stationId,
    required this.userId,
    required this.manualReading,
    this.photoPath,
    this.photoUrl,
    required this.notes,
    required this.timestamp,
    this.syncStatus = 'PENDING',
    this.confidence,
  });

  factory Verification.fromJson(Map<String, dynamic> json) {
    return Verification(
      verificationId: json['id'] ?? '',
      stationId: json['station_id'] ?? '',
      userId: json['user_id'] ?? '',
      manualReading: (json['measured_value'] as num?)?.toDouble() ?? 0.0,
      photoPath: json['photo_path'],
      photoUrl: json['photo_url'],
      notes: json['notes'] ?? '',
      timestamp: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      syncStatus: json['sync_status'] ?? 'PENDING',
      confidence: (json['confidence_score'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': verificationId,
      'station_id': stationId,
      'user_id': userId,
      'measured_value': manualReading,
      'photo_path': photoPath,
      'photo_url': photoUrl,
      'notes': notes,
      'created_at': timestamp.toIso8601String(),
      'sync_status': syncStatus,
      'confidence_score': confidence,
    };
  }

  String get formattedReading => '${manualReading.toStringAsFixed(2)}m';
  String get formattedTime => DateFormat('MMM dd, HH:mm').format(timestamp);
  bool get isPending => syncStatus == 'PENDING';
  bool get isSynced => syncStatus == 'SYNCED';
  bool get isFailed => syncStatus == 'FAILED';
  bool get hasPhoto => photoPath != null || photoUrl != null;
}
