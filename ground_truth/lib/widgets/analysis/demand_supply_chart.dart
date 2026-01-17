import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../utils/app_colors.dart';

class DemandSupplyChart extends StatelessWidget {
  final List<double> demandData;
  final List<double> supplyData;
  final List<String> months;

  const DemandSupplyChart({
    super.key,
    required this.demandData,
    required this.supplyData,
    required this.months,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Demand vs Supply Analysis',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 300,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: true,
                    horizontalInterval: 20,
                    verticalInterval: 1,
                  ),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          int index = value.toInt();
                          if (index >= 0 && index < months.length) {
                            return Text(
                              months[index],
                              style: const TextStyle(fontSize: 10),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()}',
                            style: const TextStyle(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  borderData: FlBorderData(show: true),
                  lineBarsData: [
                    // Demand line (Red)
                    LineChartBarData(
                      spots: List.generate(
                        demandData.length,
                        (index) => FlSpot(
                          index.toDouble(),
                          demandData[index],
                        ),
                      ),
                      isCurved: true,
                      color: AppColors.criticalRed,
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, percent, barData, index) =>
                            FlDotCirclePainter(
                          radius: 4,
                          color: AppColors.criticalRed,
                          strokeWidth: 2,
                          strokeColor: Colors.white,
                        ),
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.criticalRed.withValues(alpha: 0.1),
                      ),
                    ),
                    // Supply line (Green)
                    LineChartBarData(
                      spots: List.generate(
                        supplyData.length,
                        (index) => FlSpot(
                          index.toDouble(),
                          supplyData[index],
                        ),
                      ),
                      isCurved: true,
                      color: AppColors.safeGreen,
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, percent, barData, index) =>
                            FlDotCirclePainter(
                          radius: 4,
                          color: AppColors.safeGreen,
                          strokeWidth: 2,
                          strokeColor: Colors.white,
                        ),
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.safeGreen.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                  minX: 0,
                  maxX: (months.length - 1).toDouble(),
                  minY: 0,
                  maxY: 100,
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Legend
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLegendItem('Demand', AppColors.criticalRed),
                const SizedBox(width: 24),
                _buildLegendItem('Supply', AppColors.safeGreen),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(label),
      ],
    );
  }
}