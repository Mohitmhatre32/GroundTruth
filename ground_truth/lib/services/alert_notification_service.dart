import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/alert.dart';

class AlertNotificationService {
  static final AlertNotificationService _instance = AlertNotificationService._internal();
  factory AlertNotificationService() => _instance;
  AlertNotificationService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  final List<String> _seenAlertIds = [];
  GlobalKey<ScaffoldMessengerState>? _scaffoldKey;

  void setScaffoldKey(GlobalKey<ScaffoldMessengerState> key) {
    _scaffoldKey = key;
  }

  Future<void> notifyNewAlerts(List<Alert> newAlerts) async {
    if (newAlerts.isEmpty) return;

    // Filter out alerts we've already seen
    final unseenAlerts = newAlerts.where((alert) => !_seenAlertIds.contains(alert.alertId)).toList();
    
    if (unseenAlerts.isEmpty) return;

    // Mark as seen
    for (var alert in unseenAlerts) {
      _seenAlertIds.add(alert.alertId);
    }

    // Play notification sound
    await _playNotificationSound();

    // Show snackbar for the first new alert
    final firstAlert = unseenAlerts.first;
    _showTopSnackbar(firstAlert, unseenAlerts.length);
  }

  Future<void> _playNotificationSound() async {
    try {
      // Play system beep sound
      // Note: For production, add a notification sound asset file
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
      print('🔔 Alert notification sound triggered');
    } catch (e) {
      print('Sound playback error: $e');
    }
  }

  void _showTopSnackbar(Alert alert, int count) {
    // Safely check if scaffold is available and in widget tree
    try {
      if (_scaffoldKey?.currentState == null) {
        print('⚠️ ScaffoldMessenger not available yet');
        return;
      }
      
      // Add small delay to ensure scaffold is ready
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scaffoldKey?.currentState?.showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(
                  _getSeverityIcon(alert.severity),
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        count > 1 ? '$count New Alerts' : 'New Alert',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        alert.title.isNotEmpty ? alert.title : alert.message,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            backgroundColor: _getSeverityColor(alert.severity),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.only(top: 50, left: 16, right: 16),
            duration: const Duration(seconds: 4),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      });
    } catch (e) {
      print('Error showing snackbar: $e');
    }
  }

  IconData _getSeverityIcon(String severity) {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return Icons.warning_rounded;
      case 'HIGH':
      case 'WARNING':
        return Icons.priority_high_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  Color _getSeverityColor(String severity) {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return Colors.red.shade700;
      case 'HIGH':
      case 'WARNING':
        return Colors.orange.shade700;
      case 'MEDIUM':
      case 'ADVISORY':
        return Colors.amber.shade700;
      default:
        return Colors.blue.shade700;
    }
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}
