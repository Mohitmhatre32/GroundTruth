import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/station.dart';
import '../../providers/station_provider.dart';
import '../../providers/location_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/constants.dart';
import '../../widgets/station_card.dart';
import 'station_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final List<Station> _mockStations = [
    Station(
      stationId: '1',
      name: 'River Station - North',
      latitude: 28.6139,
      longitude: 77.2090,
      currentLevel: 4.5,
      warningLevel: 2.5,
      criticalLevel: 5.0,
      zone: 'SEMI_CRITICAL',
      lastUpdated: DateTime.now(),
    ),
    Station(
      stationId: '2',
      name: 'Aquifer Monitoring - West',
      latitude: 28.5355,
      longitude: 77.3910,
      currentLevel: 2.1,
      warningLevel: 2.5,
      criticalLevel: 5.0,
      zone: 'SAFE',
      lastUpdated: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    Station(
      stationId: '3',
      name: 'Well Station - South',
      latitude: 28.4595,
      longitude: 77.0266,
      currentLevel: 5.8,
      warningLevel: 2.5,
      criticalLevel: 5.0,
      zone: 'CRITICAL',
      lastUpdated: DateTime.now().subtract(const Duration(minutes: 2)),
    ),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StationProvider>().setStations(_mockStations);
      context.read<LocationProvider>().refreshLocation();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Real-Time Monitoring'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.of(context).pushNamed('/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Consumer2<StationProvider, LocationProvider>(
          builder: (context, stationProvider, locationProvider, _) {
            return Column(
              children: [
                // Statistics Cards
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      _StatCard(
                        label: 'Critical',
                        value: stationProvider.criticalCount.toString(),
                        color: AppColors.criticalRed,
                      ),
                      const SizedBox(width: 12),
                      _StatCard(
                        label: 'Warning',
                        value: stationProvider.warningCount.toString(),
                        color: AppColors.warningYellow,
                      ),
                      const SizedBox(width: 12),
                      _StatCard(
                        label: 'Safe',
                        value: stationProvider.safeCount.toString(),
                        color: AppColors.safeGreen,
                      ),
                    ],
                  ),
                ),
                // Zone Filter
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _ZoneFilterChips(
                    selectedZone: stationProvider.selectedZoneFilter,
                    onZoneSelected: (zone) {
                      stationProvider.filterByZone(zone);
                    },
                  ),
                ),
                const SizedBox(height: 16),
                // Stations List
                stationProvider.isLoading
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: CircularProgressIndicator(),
                        ),
                      )
                    : stationProvider.stations.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(32),
                              child: Column(
                                children: [
                                  const Icon(
                                    Icons.water_drop_outlined,
                                    size: 48,
                                    color: AppColors.textGrey,
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No stations found',
                                    style: Theme.of(context).textTheme.bodyLarge,
                                  ),
                                ],
                              ),
                            ),
                          )
                        : Column(
                            children: stationProvider.stations
                                .map((station) => StationCard(
                                      station: station,
                                      onTap: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                StationDetailScreen(station: station),
                                          ),
                                        );
                                      },
                                    ))
                                .toList(),
                          ),
              ]
            );
          },
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color, width: 1.5),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
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

class _ZoneFilterChips extends StatelessWidget {
  final String? selectedZone;
  final Function(String?) onZoneSelected;

  const _ZoneFilterChips({
    required this.selectedZone,
    required this.onZoneSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: FilterChip(
              label: const Text('All'),
              selected: selectedZone == null,
              onSelected: (selected) => onZoneSelected(null),
            ),
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('Safe'),
            selected: selectedZone == 'SAFE',
            onSelected: (selected) => onZoneSelected('SAFE'),
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('Semi-Critical'),
            selected: selectedZone == 'SEMI_CRITICAL',
            onSelected: (selected) => onZoneSelected('SEMI_CRITICAL'),
          ),
          const SizedBox(width: 8),
          FilterChip(
            label: const Text('Critical'),
            selected: selectedZone == 'CRITICAL',
            onSelected: (selected) => onZoneSelected('CRITICAL'),
          ),
        ],
      ),
    );
  }
}
