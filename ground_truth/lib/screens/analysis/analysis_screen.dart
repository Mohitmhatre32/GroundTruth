import 'package:flutter/material.dart';
import '../../utils/app_colors.dart';
import '../../widgets/analysis/demand_supply_chart.dart';

class AnalysisScreen extends StatefulWidget {
  const AnalysisScreen({super.key});

  @override
  State<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends State<AnalysisScreen> {
  // Mock data for demand-supply analysis
  final List<double> demandData = [45, 50, 55, 60, 65, 70, 72, 75, 78, 80, 82, 85];
  final List<double> supplyData = [80, 75, 70, 65, 60, 55, 50, 48, 45, 42, 40, 38];
  final List<String> months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Mock policies data
  final List<Map<String, dynamic>> policies = [
    {
      'name': 'Water Conservation Policy 2024',
      'impact': '15% reduction',
      'status': 'Active',
      'color': AppColors.safeGreen,
    },
    {
      'name': 'Industrial Extraction Ban',
      'impact': '25% reduction',
      'status': 'Proposed',
      'color': AppColors.warningYellow,
    },
    {
      'name': 'Rainwater Harvesting Initiative',
      'impact': '20% increase',
      'status': 'Active',
      'color': AppColors.safeGreen,
    },
  ];

  // Mock scenario data
  final List<Map<String, dynamic>> scenarios = [
    {
      'title': 'Drought Scenario',
      'description': 'Simulate 30% reduction in rainfall',
      'icon': Icons.cloud_off,
      'color': AppColors.criticalRed,
    },
    {
      'title': 'Population Growth',
      'description': 'Simulate 20% increase in demand',
      'icon': Icons.people,
      'color': AppColors.warningYellow,
    },
    {
      'title': 'Climate Change',
      'description': 'Long-term impact modeling',
      'icon': Icons.public,
      'color': AppColors.primaryBlue,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Water Analysis & Planning'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Demand-Supply Chart
              DemandSupplyChart(
                demandData: demandData,
                supplyData: supplyData,
                months: months,
              ),
              const SizedBox(height: 24),

              // Risk Score Card
              _buildRiskScoreCard(),
              const SizedBox(height: 24),

              // Scenario Planning Section
              _buildSectionTitle('Scenario Planning'),
              const SizedBox(height: 12),
              ...(scenarios.map((scenario) => _buildScenarioCard(scenario)).toList()),
              const SizedBox(height: 24),

              // Policies Section
              _buildSectionTitle('Active Policies'),
              const SizedBox(height: 12),
              ...(policies.map((policy) => _buildPolicyCard(policy)).toList()),
              const SizedBox(height: 24),

              // Zone Classification
              _buildSectionTitle('Zone Classification'),
              const SizedBox(height: 12),
              _buildZoneClassification(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRiskScoreCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Overall Risk Score',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '65/100',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.warningYellow,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'High Risk Zone',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.warningYellow,
                      width: 4,
                    ),
                  ),
                  child: Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 90,
                          height: 90,
                          child: CircularProgressIndicator(
                            value: 0.65,
                            color: AppColors.warningYellow,
                            backgroundColor: Colors.grey[200],
                            strokeWidth: 6,
                          ),
                        ),
                        const Text(
                          '65%',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Based on current groundwater levels, demand projections, and climate patterns',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScenarioCard(Map<String, dynamic> scenario) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: (scenario['color'] as Color).withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: Icon(
            scenario['icon'] as IconData,
            color: scenario['color'] as Color,
          ),
        ),
        title: Text(
          scenario['title'] as String,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(scenario['description'] as String),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Simulating: ${scenario['title']}'),
              duration: const Duration(seconds: 2),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPolicyCard(Map<String, dynamic> policy) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    policy['name'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Impact: ${policy['impact']}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: (policy['color'] as Color).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      policy['status'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        color: policy['color'] as Color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.info_outline, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildZoneClassification() {
    return Column(
      children: [
        _buildZoneCard('Safe Zone', 'Green', AppColors.safeGreen, '45% of area'),
        const SizedBox(height: 12),
        _buildZoneCard('Semi-Critical', 'Yellow', AppColors.warningYellow, '35% of area'),
        const SizedBox(height: 12),
        _buildZoneCard('Critical Zone', 'Red', AppColors.criticalRed, '20% of area'),
      ],
    );
  }

  Widget _buildZoneCard(String title, String color, Color colorValue, String percentage) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: colorValue,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    percentage,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Text(
              color,
              style: TextStyle(
                fontSize: 12,
                color: colorValue,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}