import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/alert.dart';
import '../../providers/alert_provider.dart';
import '../../utils/app_colors.dart';
import '../../widgets/alert_widget.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final List<Alert> _mockAlerts = [
    Alert(
      alertId: '1',
      stationId: '3',
      severity: 'CRITICAL',
      title: 'Critical Water Level Detected',
      message: 'Water level exceeded critical threshold at Well Station - South',
      timestamp: DateTime.now(),
      dwlrValue: 5.8,
    ),
    Alert(
      alertId: '2',
      stationId: '1',
      severity: 'HIGH',
      title: 'High Water Level Alert',
      message: 'Water level approaching warning zone at River Station - North',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
      dwlrValue: 4.5,
    ),
    Alert(
      alertId: '3',
      stationId: '2',
      severity: 'MEDIUM',
      title: 'Routine Monitoring Update',
      message: 'Water level stable at Aquifer Monitoring - West',
      timestamp: DateTime.now().subtract(const Duration(hours: 1)),
      dwlrValue: 2.1,
      isAcknowledged: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Initialize with mock alerts
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alerts & Notifications'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_outlined),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Consumer<AlertProvider>(
        builder: (context, alertProvider, _) {
          final displayAlerts = alertProvider.alerts.isEmpty ? _mockAlerts : alertProvider.alerts;
          
          return Column(
            children: [
              // Alert Stats
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    _AlertStatCard(
                      label: 'Critical',
                      count: displayAlerts.where((a) => a.isCritical && !a.isAcknowledged).length,
                      color: AppColors.criticalRed,
                    ),
                    const SizedBox(width: 12),
                    _AlertStatCard(
                      label: 'High',
                      count: displayAlerts.where((a) => a.isHigh && !a.isAcknowledged).length,
                      color: AppColors.warningYellow,
                    ),
                    const SizedBox(width: 12),
                    _AlertStatCard(
                      label: 'Unread',
                      count: displayAlerts.where((a) => !a.isAcknowledged).length,
                      color: AppColors.waterBlue,
                    ),
                  ],
                ),
              ),

              // Severity Filter
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('All'),
                        selected: alertProvider.selectedSeverityFilter == null,
                        onSelected: (_) => alertProvider.filterBySeverity(null),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('Unread'),
                        selected: alertProvider.isAcknowledgedFilter,
                        onSelected: (_) => alertProvider.toggleAcknowledgedFilter(),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('Critical'),
                        selected: alertProvider.selectedSeverityFilter == 'CRITICAL',
                        onSelected: (_) => alertProvider.filterBySeverity('CRITICAL'),
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('High'),
                        selected: alertProvider.selectedSeverityFilter == 'HIGH',
                        onSelected: (_) => alertProvider.filterBySeverity('HIGH'),
                      ),
                    ],
                  ),
                ),
              ),

              // Alerts List
              Expanded(
                child: displayAlerts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.notifications_off_outlined,
                              size: 48,
                              color: AppColors.textGrey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No alerts',
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.only(top: 8, bottom: 16),
                        itemCount: displayAlerts.length,
                        itemBuilder: (context, index) {
                          final alert = displayAlerts[index];
                          return AlertWidget(
                            alert: alert,
                            onTap: () => _showAlertDetails(context, alert),
                            onAcknowledge: () => alertProvider.acknowledge(alert.alertId),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Alerts'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CheckboxListTile(
              title: const Text('Critical Only'),
              value: false,
              onChanged: (_) {},
            ),
            CheckboxListTile(
              title: const Text('Unacknowledged Only'),
              value: false,
              onChanged: (_) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAlertDetails(BuildContext context, Alert alert) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _getSeverityColor(alert.severity),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      alert.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                alert.message,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              if (alert.dwlrValue != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.lightBlue,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'DWLR Value',
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${alert.dwlrValue!.toStringAsFixed(2)}m',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: AppColors.waterBlue,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Acknowledge & Close'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getSeverityColor(String severity) {
    switch (severity) {
      case 'CRITICAL':
        return AppColors.criticalRed;
      case 'HIGH':
        return AppColors.warningYellow;
      case 'MEDIUM':
        return AppColors.waterBlue;
      default:
        return AppColors.textGrey;
    }
  }
}

class _AlertStatCard extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _AlertStatCard({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
