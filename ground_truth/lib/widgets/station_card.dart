import 'package:flutter/material.dart';
import '../models/station.dart';
import '../utils/app_colors.dart';

class StationCard extends StatelessWidget {
  final Station station;
  final VoidCallback onTap;

  const StationCard({
    Key? key,
    required this.station,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          station.name,
                          style: Theme.of(context).textTheme.titleMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          station.formattedTime,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  _ZoneBadge(zone: station.zone),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Current Level',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textGrey,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        station.formattedLevel,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ],
                  ),
                  _LevelIndicator(station: station),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ZoneBadge extends StatelessWidget {
  final String zone;

  const _ZoneBadge({required this.zone});

  Color get _backgroundColor {
    switch (zone) {
      case 'CRITICAL':
        return AppColors.criticalRed;
      case 'SEMI_CRITICAL':
        return AppColors.warningYellow;
      default:
        return AppColors.safeGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        zone.replaceAll('_', ' '),
        style: const TextStyle(
          color: AppColors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _LevelIndicator extends StatelessWidget {
  final Station station;

  const _LevelIndicator({required this.station});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 100,
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.borderGrey),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Stack(
            children: [
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: (station.currentLevel / station.criticalLevel * 100)
                      .clamp(0, 100)
                      .toDouble(),
                  decoration: BoxDecoration(
                    color: station.isCritical
                        ? AppColors.criticalRed
                        : station.isWarning
                            ? AppColors.warningYellow
                            : AppColors.safeGreen,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${station.currentLevel.toStringAsFixed(1)}m',
          style: const TextStyle(fontSize: 10),
        ),
      ],
    );
  }
}
