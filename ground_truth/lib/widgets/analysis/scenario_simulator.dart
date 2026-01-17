import 'package:flutter/material.dart';
import '../../utils/app_colors.dart';

class ScenarioSimulator extends StatefulWidget {
  const ScenarioSimulator({super.key});

  @override
  State<ScenarioSimulator> createState() => _ScenarioSimulatorState();
}

class _ScenarioSimulatorState extends State<ScenarioSimulator> {
  double _rainfall = 100.0; // % of normal
  double _extraction = 100.0; // % of current

  double _projectedLevel = 28.0; // Current level

  void _calculateProjection() {
    // Mock logic
    // Normal recharge + rain factor - extraction
    // Let's say baseline change is -1m/year at 100/100
    double change = -1.0; 
    
    // More rain = less drop. Less rain = more drop.
    change += (_rainfall - 100) * 0.05; 
    
    // More extraction = more drop.
    change -= (_extraction - 100) * 0.05;

    setState(() {
      _projectedLevel = 28.0 - change; // Depth increases if change is negative? 
      // Actually Depth = 28m. Change -1 means it becomes 29m deep (worse).
      // So deeper is worse.
      // Let's say change is Delta Water Table (positive = rise, negative = fall)
      // Baseline is -1m (fall).
      double netChange = -1.0 + ((_rainfall - 100) * 0.02) - ((_extraction - 100) * 0.03);
      
      _projectedLevel = 28.0 - netChange; // If netChange is -1, depth becomes 29.
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSlider('Rainfall Projection (%)', _rainfall, 50, 150, (v) {
          setState(() => _rainfall = v);
          _calculateProjection();
        }),
        _buildSlider('Extraction Rate (%)', _extraction, 50, 150, (v) {
          setState(() => _extraction = v);
          _calculateProjection();
        }),

        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.lightGrey,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              const Text('Projected Water Depth (Next Year)', style: TextStyle(fontSize: 14)),
              const SizedBox(height: 8),
              Text(
                '${_projectedLevel.toStringAsFixed(1)} m',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: _projectedLevel > 30 ? Colors.red : AppColors.primaryBlue,
                ),
              ),
              Text(
                _projectedLevel > 28 ? 'Declining 📉' : 'Improving 📈',
                style: TextStyle(
                  color: _projectedLevel > 28 ? Colors.red : Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSlider(String label, double value, double min, double max, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$label: ${value.round()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
        Slider(
          value: value,
          min: min,
          max: max,
          activeColor: AppColors.primaryBlue,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
