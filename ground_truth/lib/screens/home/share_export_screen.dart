import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../../utils/app_colors.dart';

class ShareExportScreen extends StatefulWidget {
  const ShareExportScreen({super.key});

  @override
  State<ShareExportScreen> createState() => _ShareExportScreenState();
}

class _ShareExportScreenState extends State<ShareExportScreen> {
  String _selectedFormat = 'CSV';
  DateTimeRange? _dateRange;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Export & Share'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info Card
            Card(
              color: AppColors.lightBlue,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: AppColors.waterBlue,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Export groundwater data for analysis and share reports',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Format Selection
            Text(
              'Export Format',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _FormatButton(
                  label: 'CSV',
                  selected: _selectedFormat == 'CSV',
                  onTap: () => setState(() => _selectedFormat = 'CSV'),
                ),
                const SizedBox(width: 12),
                _FormatButton(
                  label: 'PDF',
                  selected: _selectedFormat == 'PDF',
                  onTap: () => setState(() => _selectedFormat = 'PDF'),
                ),
                const SizedBox(width: 12),
                _FormatButton(
                  label: 'Excel',
                  selected: _selectedFormat == 'Excel',
                  onTap: () => setState(() => _selectedFormat = 'Excel'),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Date Range
            Text(
              'Date Range',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'From',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _dateRange?.start.toString().split(' ')[0] ?? 'Select date',
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.calendar_today_outlined),
                          onPressed: () => _selectDateRange(context),
                        ),
                      ],
                    ),
                    if (_dateRange != null) ...[
                      const Divider(),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'To',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _dateRange!.end.toString().split(' ')[0],
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Station Filter
            Text(
              'Select Stations',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Column(
              children: [
                _StationCheckbox(label: 'River Station - North'),
                _StationCheckbox(label: 'Aquifer Monitoring - West'),
                _StationCheckbox(label: 'Well Station - South'),
              ],
            ),
            const SizedBox(height: 32),

            // Action Buttons
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.file_download_outlined),
                label: Text('Generate $_selectedFormat Report'),
                onPressed: _generateReport,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.share_outlined),
                label: const Text('Share Report'),
                onPressed: _shareReport,
              ),
            ),
            const SizedBox(height: 32),

            // Quick Share
            Text(
              'Quick Share Options',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ShareButton(
                    icon: Icons.chat,
                    label: 'WhatsApp',
                    onTap: _shareViaWhatsApp,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ShareButton(
                    icon: Icons.mail_outline,
                    label: 'Email',
                    onTap: _shareViaEmail,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2024),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  void _generateReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Generating $_selectedFormat report...'),
        duration: const Duration(seconds: 2),
      ),
    );

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report generated successfully'),
            backgroundColor: AppColors.safeGreen,
          ),
        );
      }
    });
  }

  void _shareReport() {
    Share.share(
      'GroundTruth Report - Groundwater Monitoring Data\n\nFormat: $_selectedFormat\nDate Range: ${_dateRange?.start ?? "N/A"} to ${_dateRange?.end ?? "N/A"}\n\nShared from GroundTruth App',
      subject: 'Groundwater Monitoring Report',
    );
  }

  void _shareViaWhatsApp() {
    Share.share(
      'Check out the latest groundwater levels and alerts from GroundTruth!\n\nDownload the app to stay updated: https://groundtruth.app',
    );
  }

  void _shareViaEmail() {
    Share.share(
      'GroundTruth - Real-Time Groundwater Monitoring\n\nStay informed about water levels and critical alerts.\n\nDownload: https://groundtruth.app',
    );
  }
}

class _FormatButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FormatButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppColors.waterBlue : AppColors.lightGrey,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: selected ? AppColors.waterBlue : AppColors.borderGrey,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: selected ? AppColors.white : AppColors.darkGrey,
            ),
          ),
        ),
      ),
    );
  }
}

class _StationCheckbox extends StatefulWidget {
  final String label;

  const _StationCheckbox({required this.label});

  @override
  State<_StationCheckbox> createState() => _StationCheckboxState();
}

class _StationCheckboxState extends State<_StationCheckbox> {
  bool _checked = true;

  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      value: _checked,
      onChanged: (value) => setState(() => _checked = value ?? false),
      title: Text(widget.label),
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }
}

class _ShareButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ShareButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.lightGrey,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: AppColors.waterBlue,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
