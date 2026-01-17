import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../services/api_service.dart';
import '../../utils/app_colors.dart';

import 'alerts_inbox_screen.dart';


class FarmerHomeScreen extends StatefulWidget {
  const FarmerHomeScreen({Key? key}) : super(key: key);

  @override
  State<FarmerHomeScreen> createState() => _FarmerHomeScreenState();
}

class _FarmerHomeScreenState extends State<FarmerHomeScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _nearestStation;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      // 1. Get User Location
      final position = await _determinePosition();
      
      // 2. Get Stations from API
      final stations = await context.read<ApiService>().getStations();
      
      if (stations.isNotEmpty) {
        // 3. Find Nearest Station
        // We calculate distance to each station and sort
        stations.sort((a, b) {
          final distA = Geolocator.distanceBetween(
            position.latitude, 
            position.longitude, 
            a['latitude'], 
            a['longitude']
          );
          final distB = Geolocator.distanceBetween(
            position.latitude, 
            position.longitude, 
            b['latitude'], 
            b['longitude']
          );
          return distA.compareTo(distB);
        });

        setState(() {
          _nearestStation = stations.first; 
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = "No monitoring stations found from API.";
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Location/API details: $e";
          _isLoading = false;
        });
      }
    }
  }

  /// Determine the current position of the device.
  /// When the location services are not enabled or permissions
  /// are denied the `Future` will return an error.
  Future<Position> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled don't continue
      // accessing the position and request users of the 
      // App to enable the location services.
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied, next time you could try
        // requesting permissions again (this is also where
        // Android's shouldShowRequestPermissionRationale 
        // returned true. According to Android guidelines
        // your App should show an explanatory UI now.
        return Future.error('Location permissions are denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately. 
      return Future.error(
        'Location permissions are permanently denied, we cannot request permissions.');
    } 

    // When we reach here, permissions are granted and we can
    // continue accessing the position of the device.
    return await Geolocator.getCurrentPosition();
  }

  Color _getStatusColor(String status) {
    if (status == 'Safe') return AppColors.safeGreen;
    if (status == 'Critical') return Colors.red;
    return AppColors.warningYellow;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Home Dashboard'),
        backgroundColor: AppColors.primaryBlue,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AlertsInboxScreen()),
              );
            },
          ),
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
            ? Center(child: Text(_errorMessage))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // GPS Location Card
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.lightGrey,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.gps_fixed, color: AppColors.primaryBlue),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Nearest Station: ${_nearestStation!['name']}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  'Lat: ${_nearestStation!['latitude']}, Lng: ${_nearestStation!['longitude']}',
                                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Radial Gauge
                    _buildRadialGauge(),

                    const SizedBox(height: 32),

                    // Stats Grid
                    _buildStatsGrid(),
                  ],
                ),
              ),
    );
  }

  Widget _buildRadialGauge() {
    final double depth = _nearestStation!['current_depth_m'];
    final String status = _nearestStation!['status'];
    final Color color = _getStatusColor(status);
    
    // Normalize depth for progress (Assuming max depth 50m for gauge)
    final double progress = (depth / 50.0).clamp(0.0, 1.0);

    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
             SizedBox(
              width: 200,
              height: 200,
              child: CircularProgressIndicator(
                value: 1.0,
                strokeWidth: 20,
                color: Colors.grey.shade200,
              ),
            ),
            SizedBox(
              width: 200,
              height: 200,
              child: CircularProgressIndicator(
                value: progress,
                strokeWidth: 20,
                color: color,
                backgroundColor: Colors.transparent,
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${depth}m',
                  style: TextStyle(
                    fontSize: 40, 
                    fontWeight: FontWeight.bold,
                    color: color
                  ),
                ),
                Text(
                  status,
                  style: TextStyle(
                    fontSize: 18, 
                    fontWeight: FontWeight.w500,
                    color: color
                  ),
                ),
              ],
            )
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          'Live Groundwater Level',
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      ],
    );
  }

  Widget _buildStatsGrid() {
    // Generate trend based on random mock for now
    final isRising = _nearestStation!['current_depth_m'] < 25; 

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Trend',
            isRising ? 'Rising' : 'Falling',
            isRising ? Icons.arrow_upward : Icons.arrow_downward,
            isRising ? Colors.green : Colors.red,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Today\'s Status',
            _nearestStation!['status'] == 'Safe' ? 'Normal' : 'Alert',
             _nearestStation!['status'] == 'Safe' ? Icons.check_circle : Icons.warning,
             _nearestStation!['status'] == 'Safe' ? AppColors.safeGreen : AppColors.warningYellow,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
