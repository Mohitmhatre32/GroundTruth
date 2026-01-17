import 'package:flutter/material.dart';

class ZoneClassifier {
  /// Defines zone status
  static const String safe = 'SAFE';
  static const String semiCritical = 'SEMI_CRITICAL';
  static const String critical = 'CRITICAL';

  /// Classify zone based on water level (meters below ground) and demand (liters)
  /// Simple logic: 
  /// < 10m depth -> Safe
  /// 10m - 20m -> Semi-Critical
  /// > 20m -> Critical
  /// Or adjusted by demand pressure.
  static String classify({required double waterLevelInfo, required double demand}) {
    // Basic Depth Logic
    if (waterLevelInfo < 10.0) {
      if (demand > 5000) return semiCritical; // High demand puts pressure
      return safe;
    } else if (waterLevelInfo < 20.0) {
      if (demand > 8000) return critical; // Very high demand in semi-zone
      return semiCritical;
    } else {
      return critical;
    }
  }

  static Color getColor(String status) {
    switch (status) {
      case safe:
        return Colors.green;
      case semiCritical:
        return Colors.orange;
      case critical:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  static String getLabel(String status) {
    switch (status) {
      case safe:
        return 'Safe Zone';
      case semiCritical:
        return 'Semi-Critical';
      case critical:
        return 'Critical Zone';
      default:
        return 'Unknown';
    }
  }
}
