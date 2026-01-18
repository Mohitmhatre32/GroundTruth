import 'dart:ui';
import 'package:flutter/material.dart';
import '../../utils/app_colors.dart';
import '../../widgets/animated_gradient_background.dart';

class AlertsInboxScreen extends StatefulWidget {
  const AlertsInboxScreen({super.key});

  @override
  State<AlertsInboxScreen> createState() => _AlertsInboxScreenState();
}

class _AlertsInboxScreenState extends State<AlertsInboxScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<AnimatedListState> _listKey = GlobalKey<AnimatedListState>();
  late AnimationController _animController;

  // Mock Data (moved to state for animation simulation)
  final List<Map<String, dynamic>> _alerts = [
    {
      'title': 'Critical Drop Detected',
      'description': 'Groundwater level dropped 3m in 24 hours at Well WL-001',
      'severity': 'Critical',
      'severityColor': Colors.red,
      'timestamp': '2 hours ago',
      'icon': Icons.arrow_downward,
    },
    {
      'title': 'Drought Forecast Advisory',
      'description': 'IMD predicts below-average rainfall for next 2 weeks',
      'severity': 'Advisory',
      'severityColor': AppColors.warningYellow,
      'timestamp': '5 hours ago',
      'icon': Icons.cloud_off,
    },
    {
      'title': 'Water Quality Alert',
      'description': 'Nitrate levels exceed recommended limits at Well WL-005',
      'severity': 'High',
      'severityColor': Colors.orange,
      'timestamp': '1 day ago',
      'icon': Icons.warning_amber,
    },
    {
      'title': 'Government Scheme Update',
      'description': 'New subsidy available for drip irrigation systems',
      'severity': 'Info',
      'severityColor': AppColors.primaryBlue,
      'timestamp': '2 days ago',
      'icon': Icons.info_outline,
    },
    {
      'title': 'Water Level Stabilized',
      'description': 'Groundwater level at Well WL-002 returned to safe levels',
      'severity': 'Safe',
      'severityColor': AppColors.safeGreen,
      'timestamp': '3 days ago',
      'icon': Icons.check_circle,
    },
  ];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Alerts Inbox', style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white.withOpacity(0),
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.primaryBlue),
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
      ),
      body: Stack(
        children: [
          // Background Gradient
          const Positioned.fill(child: AnimatedGradientBackground()),
          
          SafeArea(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              physics: const BouncingScrollPhysics(),
              itemCount: _alerts.length,
              itemBuilder: (context, index) {
                final alert = _alerts[index];
                // Staggered Animation
                return SlideTransition(
                  position: Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
                    CurvedAnimation(
                      parent: _animController,
                      curve: Interval(index * 0.1, 1.0, curve: Curves.easeOutBack),
                    ),
                  ),
                  child: FadeTransition(
                    opacity: CurvedAnimation(
                      parent: _animController,
                      curve: Interval(index * 0.1, 1.0, curve: Curves.easeOut),
                    ),
                    child: _buildGlassAlertCard(alert),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassAlertCard(Map<String, dynamic> alert) {
    Color severityColor = alert['severityColor'];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: severityColor.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {},
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: severityColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(alert['icon'], color: severityColor, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                alert['title'],
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: AppColors.black,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: severityColor.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      alert['severity'].toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: severityColor,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    alert['timestamp'],
                                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      alert['description'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.black87.withOpacity(0.8),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {},
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.textGrey,
                              side: BorderSide(color: Colors.black.withOpacity(0.1)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Dismiss'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: severityColor,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              shadowColor: severityColor.withOpacity(0.4),
                            ),
                            child: const Text('Action'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
