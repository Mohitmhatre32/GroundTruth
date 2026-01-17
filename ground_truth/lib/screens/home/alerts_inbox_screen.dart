import 'package:flutter/material.dart';
import '../../utils/app_colors.dart';

class AlertsInboxScreen extends StatelessWidget {
  const AlertsInboxScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alerts Inbox'),
        backgroundColor: AppColors.primaryBlue,
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // Critical Alert
          _buildAlertCard(
            title: 'Critical Drop Detected',
            description: 'Groundwater level dropped 3m in 24 hours at Well WL-001',
            severity: 'Critical',
            severityColor: Colors.red,
            timestamp: '2 hours ago',
            icon: Icons.arrow_downward,
            backgroundColor: Colors.red.withOpacity(0.1),
          ),
          const SizedBox(height: 12),

          // Advisory Alert
          _buildAlertCard(
            title: 'Drought Forecast Advisory',
            description: 'IMD predicts below-average rainfall for next 2 weeks',
            severity: 'Advisory',
            severityColor: AppColors.warningYellow,
            timestamp: '5 hours ago',
            icon: Icons.cloud_off,
            backgroundColor: AppColors.warningYellow.withOpacity(0.1),
          ),
          const SizedBox(height: 12),

          // High Priority Alert
          _buildAlertCard(
            title: 'Water Quality Alert',
            description: 'Nitrate levels exceed recommended limits at Well WL-005',
            severity: 'High',
            severityColor: Colors.orange,
            timestamp: '1 day ago',
            icon: Icons.warning_amber,
            backgroundColor: Colors.orange.withOpacity(0.1),
          ),
          const SizedBox(height: 12),

          // Info Alert
          _buildAlertCard(
            title: 'Government Scheme Update',
            description: 'New subsidy available for drip irrigation systems',
            severity: 'Info',
            severityColor: AppColors.primaryBlue,
            timestamp: '2 days ago',
            icon: Icons.info_outline,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
          ),
          const SizedBox(height: 12),

          // Safe Status Update
          _buildAlertCard(
            title: 'Water Level Stabilized',
            description: 'Groundwater level at Well WL-002 returned to safe levels',
            severity: 'Safe',
            severityColor: AppColors.safeGreen,
            timestamp: '3 days ago',
            icon: Icons.check_circle,
            backgroundColor: AppColors.safeGreen.withOpacity(0.1),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard({
    required String title,
    required String description,
    required String severity,
    required Color severityColor,
    required String timestamp,
    required IconData icon,
    required Color backgroundColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border.all(color: severityColor.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: severityColor, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: severityColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        severity,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: severityColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            timestamp,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textGrey,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  child: const Text('Dismiss'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: severityColor,
                  ),
                  child: const Text('Action'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
