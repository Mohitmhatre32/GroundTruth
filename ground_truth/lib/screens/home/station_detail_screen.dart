import 'package:flutter/material.dart';
import '../../models/station.dart';
import '../../utils/app_colors.dart';
import '../../widgets/zone_indicator.dart';

class StationDetailScreen extends StatelessWidget {
  final Station station;

  const StationDetailScreen({
    Key? key,
    required this.station,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Station Details'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Card(
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
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Last updated: ${station.formattedTime}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          Icons.location_on,
                          color: AppColors.waterBlue,
                          size: 32,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Zone Indicator
            Text(
              'Zone Classification',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            ZoneIndicator(
              zone: station.zone,
              level: station.currentLevel,
              criticalLevel: station.criticalLevel,
            ),
            const SizedBox(height: 24),

            // Water Level Details
            Text(
              'Water Level Details',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            _DetailRow(
              label: 'Current Level',
              value: station.formattedLevel,
              color: _getLevelColor(),
            ),
            const Divider(),
            _DetailRow(
              label: 'Warning Threshold',
              value: '${station.warningLevel.toStringAsFixed(2)}m',
              color: AppColors.warningYellow,
            ),
            const Divider(),
            _DetailRow(
              label: 'Critical Threshold',
              value: '${station.criticalLevel.toStringAsFixed(2)}m',
              color: AppColors.criticalRed,
            ),
            const SizedBox(height: 24),

            // Station Info
            Text(
              'Station Information',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            _DetailRow(
              label: 'Station ID',
              value: station.stationId,
            ),
            const Divider(),
            _DetailRow(
              label: 'Coordinates',
              value: '${station.latitude.toStringAsFixed(4)}, ${station.longitude.toStringAsFixed(4)}',
            ),
            const Divider(),
            _DetailRow(
              label: 'Status',
              value: station.isActive ? 'Active' : 'Inactive',
              color: station.isActive ? AppColors.safeGreen : AppColors.textGrey,
            ),
            const SizedBox(height: 24),

            // Action Buttons
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.edit_location_outlined),
                label: const Text('Submit Verification'),
                onPressed: () => _showVerificationDialog(context),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.share_outlined),
                label: const Text('Share'),
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getLevelColor() {
    if (station.isCritical) return AppColors.criticalRed;
    if (station.isWarning) return AppColors.warningYellow;
    return AppColors.safeGreen;
  }

  void _showVerificationDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Submit Field Verification',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Water Level (meters)',
                hintText: 'Enter measured level',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Notes',
                hintText: 'Add any additional notes',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Submit'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _DetailRow({
    required this.label,
    required this.value,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textGrey,
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
          ),
        ],
      ),
    );
  }
}
