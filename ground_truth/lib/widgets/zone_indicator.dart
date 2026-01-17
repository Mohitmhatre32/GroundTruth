import 'package:flutter/material.dart';
import '../utils/app_colors.dart';

class ZoneIndicator extends StatelessWidget {
  final String zone;
  final double level;
  final double criticalLevel;

  const ZoneIndicator({
    Key? key,
    required this.zone,
    required this.level,
    required this.criticalLevel,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: _getZoneColor(),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Text(
                zone.replaceAll('_', ' '),
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _getZoneDescription(),
                style: const TextStyle(
                  color: Color(0xFFE0E0E0),
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: (level / criticalLevel).clamp(0, 1),
            minHeight: 8,
            backgroundColor: AppColors.lightGrey,
            valueColor: AlwaysStoppedAnimation<Color>(_getZoneColor()),
          ),
        ),
      ],
    );
  }

  Color _getZoneColor() {
    switch (zone) {
      case 'CRITICAL':
        return AppColors.criticalRed;
      case 'SEMI_CRITICAL':
        return AppColors.warningYellow;
      default:
        return AppColors.safeGreen;
    }
  }

  String _getZoneDescription() {
    switch (zone) {
      case 'CRITICAL':
        return 'Immediate action required';
      case 'SEMI_CRITICAL':
        return 'Monitor closely';
      default:
        return 'Stable conditions';
    }
  }
}
