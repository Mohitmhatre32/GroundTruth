import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/app_colors.dart';
import '../../widgets/animated_gradient_background.dart';
import '../../providers/alert_provider.dart';
import '../../models/alert.dart';

class AlertsInboxScreen extends StatefulWidget {
  const AlertsInboxScreen({super.key});

  @override
  State<AlertsInboxScreen> createState() => _AlertsInboxScreenState();
}

class _AlertsInboxScreenState extends State<AlertsInboxScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final alertProvider = context.watch<AlertProvider>();
    final alerts = alertProvider.alerts;
    final isLoading = alertProvider.isLoading;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text(
          'Alerts Inbox',
          style: TextStyle(
            color: AppColors.primaryBlue,
            fontWeight: FontWeight.bold,
          ),
        ),
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
            child: isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primaryBlue,
                    ),
                  )
                : alerts.isEmpty
                    ? const Center(
                        child: Text(
                          "No alerts found.",
                          style: TextStyle(
                            color: AppColors.textGrey,
                            fontSize: 16,
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 20,
                        ),
                        physics: const BouncingScrollPhysics(),
                        itemCount: alerts.length,
                        itemBuilder: (context, index) {
                          final alert = alerts[index];

                          return SlideTransition(
                            position: Tween<Offset>(
                              begin: const Offset(0, 0.5),
                              end: Offset.zero,
                            ).animate(
                              CurvedAnimation(
                                parent: _animController,
                                curve: Interval(
                                  (index * 0.1).clamp(0.0, 1.0),
                                  1.0,
                                  curve: Curves.easeOutBack,
                                ),
                              ),
                            ),
                            child: FadeTransition(
                              opacity: CurvedAnimation(
                                parent: _animController,
                                curve: Interval(
                                  (index * 0.1).clamp(0.0, 1.0),
                                  1.0,
                                  curve: Curves.easeOut,
                                ),
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

  Widget _buildGlassAlertCard(Alert alert) {
    // Map severity to color and icon
    Color severityColor;
    IconData icon;

    switch (alert.severity.toUpperCase()) {
      case 'CRITICAL':
        severityColor = AppColors.criticalRed;
        icon = Icons.warning_rounded;
        break;
      case 'HIGH':
      case 'WARNING':
        severityColor = Colors.orange;
        icon = Icons.priority_high_rounded;
        break;
      case 'MEDIUM':
      case 'ADVISORY':
        severityColor = AppColors.warningYellow;
        icon = Icons.info_outline_rounded;
        break;
      case 'LOW':
      case 'SAFE':
      case 'INFO':
        severityColor = AppColors.safeGreen;
        icon = Icons.check_circle_outline_rounded;
        break;
      default:
        severityColor = AppColors.primaryBlue;
        icon = Icons.notifications_none_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.6),
          width: 1.5,
        ),
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
              onTap: () {
                // Future: Show detailed alert view
              },
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
                          child: Icon(icon, color: severityColor, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                alert.title.isNotEmpty
                                    ? alert.title
                                    : 'Alert',
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
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          severityColor.withOpacity(0.2),
                                      borderRadius:
                                          BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      alert.severity.toUpperCase(),
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
                                    alert.formattedTime,
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey[600],
                                    ),
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
                      alert.message,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.black87.withOpacity(0.8),
                        height: 1.5,
                      ),
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
