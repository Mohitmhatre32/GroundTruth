import 'package:flutter/material.dart';
import '../models/alert.dart';
import '../utils/app_colors.dart';

class AlertWidget extends StatelessWidget {
  final Alert alert;
  final VoidCallback onTap;
  final VoidCallback? onAcknowledge;

  const AlertWidget({
    Key? key,
    required this.alert,
    required this.onTap,
    this.onAcknowledge,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        color: _getBackgroundColor().withOpacity(0.95),
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
                        Row(
                          children: [
                            _getSeverityIcon(),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                alert.title,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      color: AppColors.white,
                                    ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          alert.formattedTime,
                          style: const TextStyle(
                            color: Color(0xFFE0E0E0),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!alert.isAcknowledged)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.white,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                alert.message,
                style: const TextStyle(
                  color: AppColors.white,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (alert.dwlrValue != null) ...[
                const SizedBox(height: 8),
                Text(
                  'DWLR: ${alert.dwlrValue!.toStringAsFixed(2)}m',
                  style: const TextStyle(
                    color: Color(0xFFE0E0E0),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (alert.severity) {
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

  Widget _getSeverityIcon() {
    IconData icon;
    switch (alert.severity) {
      case 'CRITICAL':
        icon = Icons.warning_rounded;
        break;
      case 'HIGH':
        icon = Icons.error_outline;
        break;
      case 'MEDIUM':
        icon = Icons.info_outline;
        break;
      default:
        icon = Icons.check_circle_outline;
    }
    return Icon(icon, color: AppColors.white, size: 20);
  }
}
