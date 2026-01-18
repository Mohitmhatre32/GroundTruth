// ignore_for_file: unused_import, use_super_parameters

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../services/api_service.dart';
import '../../utils/app_colors.dart';
import '../../widgets/liquid_wave_card.dart';
import 'alerts_inbox_screen.dart';

class FarmerHomeScreen extends StatefulWidget {
  const FarmerHomeScreen({Key? key}) : super(key: key);

  @override
  State<FarmerHomeScreen> createState() => _FarmerHomeScreenState();
}

class _FarmerHomeScreenState extends State<FarmerHomeScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  Map<String, dynamic>? _nearestStation;
  String _errorMessage = '';
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _loadDashboardData();
  }
  
  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
    try {
      final position = await _determinePosition();
      final stations = await context.read<ApiService>().getStations();
      
      if (stations.isNotEmpty) {
        stations.sort((a, b) {
          final distA = Geolocator.distanceBetween(
            position.latitude, position.longitude, 
            a['latitude'], a['longitude']
          );
          final distB = Geolocator.distanceBetween(
            position.latitude, position.longitude, 
            b['latitude'], b['longitude']
          );
          return distA.compareTo(distB);
        });

        if (mounted) {
          setState(() {
            _nearestStation = stations.first; 
            _isLoading = false;
          });
          _animController.forward();
        }
      } else {
        if (mounted) setState(() {
          _errorMessage = "No monitoring stations found.";
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Unable to locate nearby stations.\nPlease check GPS & Internet.";
          _isLoading = false;
        });
      }
    }
  }

  Future<Position> _determinePosition() async {
    // Basic geolocator logic (simplified for UI file)
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) throw 'Location services disabled.';
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) throw 'Permissions denied';
    }
    if (permission == LocationPermission.deniedForever) throw 'Permissions permanently denied';
    return await Geolocator.getCurrentPosition();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Background Decor (Blobs) - Removed to show Global Gradient
          
          SafeArea(
            child: _isLoading 
              ? Center(child: CircularProgressIndicator(color: AppColors.primaryBlue))
              : _errorMessage.isNotEmpty
                ? Center(child: Text(_errorMessage, textAlign: TextAlign.center, style: TextStyle(color: AppColors.textGrey)))
                : SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      children: [
                        // Custom AppBar (Now Scrollable)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text("Hello, Farmer", style: TextStyle(color: AppColors.textGrey, fontSize: 14)),
                                  Text("Dashboard", style: TextStyle(color: AppColors.primaryBlue, fontSize: 24, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
                                ),
                                child: IconButton(
                                  icon: Icon(Icons.notifications_none, color: AppColors.primaryBlue),
                                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AlertsInboxScreen())),
                                ),
                              )
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Main Content
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // 1. GPS Card (Slide Down)
                              SlideTransition(
                                position: Tween<Offset>(begin: const Offset(0, -0.2), end: Offset.zero).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut)),
                                child: FadeTransition(
                                  opacity: _animController,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: AppColors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: AppColors.softBlue),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.location_on, color: AppColors.accentCyan),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(_nearestStation!['name'], style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.black)),
                                              Text("Connected Station", style: TextStyle(fontSize: 10, color: AppColors.textGrey)),
                                            ],
                                          ),
                                        ),
                                        Icon(Icons.wifi, color: AppColors.safeGreen, size: 16),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              
                              const SizedBox(height: 24),

                              // 2. Liquid Wave Card (Scale In)
                              ScaleTransition(
                                scale: CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
                                child: LiquidWaveCard(
                                  depth: _nearestStation!['current_depth_m'].toDouble(),
                                  status: _nearestStation!['status'],
                                  percentage: (100 - _nearestStation!['current_depth_m']) / 100.0,
                                ),
                              ),

                              const SizedBox(height: 32),
                              
                              Text("Real-Time Insights", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryBlue)),
                              const SizedBox(height: 16),

                              // 3. Grid (Staggered)
                              _buildAnimatedGrid(),
                              
                              const SizedBox(height: 24),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedGrid() {
    // Example Stats
    final List<Map<String, dynamic>> stats = [
      {'title': 'Status', 'val': _nearestStation!['status'], 'icon': Icons.shield, 'color': _getStatusColor(_nearestStation!['status'])},
      {'title': 'Trend', 'val': 'Stable', 'icon': Icons.show_chart, 'color': AppColors.primaryBlue},
      {'title': 'Battery', 'val': '98%', 'icon': Icons.battery_full, 'color': AppColors.safeGreen},
      {'title': 'Last Update', 'val': '2m ago', 'icon': Icons.schedule, 'color': AppColors.warningYellow},
    ];

    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - 64) / 2;

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      alignment: WrapAlignment.start,
      runAlignment: WrapAlignment.start,
      children: List.generate(stats.length, (index) {
        final Animation<double> animation = Tween<double>(begin: 0.0, end: 1.0).animate(
          CurvedAnimation(
            parent: _animController,
            curve: Interval((1 / stats.length) * index, 1.0, curve: Curves.easeOut),
          ),
        );

        return FadeTransition(
          opacity: animation,
          child: Transform.translate(
            offset: Offset(0, 50 * (1 - animation.value)),
            child: SizedBox(
              width: cardWidth,
              height: 140,
              child: _build3DCard(stats[index]),
            ),
          ),
        );
      }),
    );
  }

  Widget _build3DCard(Map<String, dynamic> stat) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: AppColors.shadowColor, blurRadius: 15, offset: Offset(0, 8)),
        ],
      ),
      child: Stack(
        children: [
          Positioned(right: -10, top: -10, child: Icon(stat['icon'], size: 60, color: (stat['color'] as Color).withOpacity(0.05))),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(color: (stat['color'] as Color).withOpacity(0.1), shape: BoxShape.circle),
                  child: Icon(stat['icon'], color: stat['color'], size: 20),
                ),
                Spacer(),
                Text(stat['val'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.black)),
                Text(stat['title'], style: TextStyle(fontSize: 12, color: AppColors.textGrey)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    if (status == 'Safe') return AppColors.safeGreen;
    if (status == 'Critical') return AppColors.criticalRed;
    return AppColors.warningYellow;
  }
}
