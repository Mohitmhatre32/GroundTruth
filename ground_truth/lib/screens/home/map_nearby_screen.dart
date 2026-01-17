import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geocoding/geocoding.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../services/api_service.dart';
import '../../services/location_service.dart';
import '../../utils/app_colors.dart';

class MapNearbyScreen extends StatefulWidget {
  const MapNearbyScreen({super.key});

  @override
  State<MapNearbyScreen> createState() => _MapNearbyScreenState();
}

class _MapNearbyScreenState extends State<MapNearbyScreen> {
  late MapController _mapController;
  LatLng _userLocation = const LatLng(20.5937, 78.9629); // Default India center
  List<WellMarker> _wells = [];
  bool _isLoading = true;

  // State variables for enhancements
  bool _isSatellite = false;
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  Future<void> _searchLocation(String query) async {
    if (query.isEmpty) return;
    
    setState(() {
      _isLoading = true;
    });

    try {
      List<Location> locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        Location loc = locations.first;
        LatLng newPos = LatLng(loc.latitude, loc.longitude);
         // Optionally confirm with user or just fly there
        _mapController.move(newPos, 14);
      } else {
        if(mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Location not found')),
          );
        }
      }
    } catch (e) {
      if(mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error finding location: $e')),
        );
      }
    } finally {
      if(mounted) {
        setState(() {
          _isLoading = false;
          _isSearching = false; // Close search bar usually
        });
      }
    }
  }

  Future<void> _initMapData() async {
    try {
      // 0. Check Internet
      final hasInternet = await context.read<ApiService>().checkInternet();
      if (!hasInternet) {
        if(mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No Internet Connection. Please enable mobile data or Wifi.')),
          );
        }
        // Proceeding anyway but API calls might fail
      }

      // 1. Get User Location (Using robust LocationService)
      // Note: We need to import LocationService
      final position = await context.read<LocationService>().getCurrentLocation();
      
      if (position == null) {
          if(mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location Permission/Service Required.')),
            );
          }
          // Default location
      } else {
        setState(() {
          _userLocation = LatLng(position.latitude, position.longitude);
          _isLoading = true;
        });
        // Move map to user
        WidgetsBinding.instance.addPostFrameCallback((_) {
           _mapController.move(_userLocation, 14);
        });
      }

      // 2. Get Stations form API
      final stations = await context.read<ApiService>().getStations();
      
      // 3. Convert to Markers
      final markers = stations.map((s) {
        final loc = LatLng(s['latitude'], s['longitude']);
        double dist = 0;
        if (position != null) {
           dist = Geolocator.distanceBetween(
             position.latitude, position.longitude, 
             loc.latitude, loc.longitude
           );
        }
        
        return WellMarker(
          id: s['id'],
          location: loc,
          title: s['name'],
          wellId: s['id'],
          distance: '${(dist/1000).toStringAsFixed(1)}km',
          depth: '${s['current_depth_m']}m',
          status: s['status'],
          color: _getStatusColor(s['status']),
        );
      }).toList();

      // Add User Marker if we have location
      if (position != null) {
        markers.add(WellMarker(
          id: 'user',
          location: _userLocation,
          title: 'You are here',
          wellId: 'ME',
          distance: '0km',
          depth: '-',
          status: 'current',
          color: AppColors.primaryBlue,
        ));
      }

      setState(() {
        _wells = markers;
        _isLoading = false;
      });

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        setState(() => _isLoading = false);
      }
    }
  }
  
  Color _getStatusColor(String status) {
    if (status == 'Safe') return AppColors.safeGreen;
    if (status == 'Critical') return Colors.red;
    return AppColors.warningYellow;
  }
  
  // Removed local _determinePosition as we use LocationService now

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _initMapData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true, // Make map fill screen
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Search location...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.white70),
                ),
                style: TextStyle(color: Colors.white),
                onSubmitted: (value) => _searchLocation(value),
              )
            : const Text('Map & Nearby Wells'),
        backgroundColor: AppColors.primaryBlue.withAlpha((0.9 * 255).round()),
        elevation: 0,
        actions: [
          if (_isSearching)
            IconButton(
              icon: Icon(Icons.close),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchController.clear();
                });
              },
            )
          else
            IconButton(
              icon: Icon(Icons.search),
              onPressed: () {
                setState(() {
                  _isSearching = true;
                });
              },
            ),
        ],
      ),
      body: Stack(
        children: [
          // Map
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _userLocation,
              initialZoom: 14,
              maxZoom: 18,
              minZoom: 2,
            ),
            children: [
              // Tile Layer (Switchable)
              TileLayer(
                urlTemplate: _isSatellite
                    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.technova.ground_truth', // Updated to match potential real package
                // Add attribution for Esri if using satellite
              ),

              // Markers
              MarkerLayer(
                markers: _wells
                    .map(
                      (well) => Marker(
                        point: well.location,
                        width: 40,
                        height: 40,
                        child: GestureDetector(
                          onTap: () => _showWellDetails(well),
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: well.color,
                              border: Border.all(
                                color: Colors.white,
                                width: 3,
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black26,
                                  blurRadius: 4,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Icon(
                              well.status == 'current'
                                  ? Icons.my_location
                                  : Icons.water_drop,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),

          // Layer Switcher
          Positioned(
            right: 16,
            top: 100, // Below AppBar
            child: Column(
              children: [
                FloatingActionButton.small(
                  heroTag: 'layer_toggle',
                  backgroundColor: Colors.white,
                  onPressed: () {
                    setState(() {
                      _isSatellite = !_isSatellite;
                    });
                  },
                  child: Icon(
                    _isSatellite ? Icons.map : Icons.satellite_alt,
                    color: AppColors.primaryBlue,
                  ),
                ),
                SizedBox(height: 8),
                FloatingActionButton.small(
                  heroTag: 'my_loc',
                  backgroundColor: Colors.white,
                  onPressed: () {
                     _mapController.move(_userLocation, 14);
                  },
                  child: const Icon(Icons.my_location, color: AppColors.primaryBlue,),
                ),
              ],
            ),
          ),
          
          if (_isLoading)
            Center(
              child: Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),

          // Bottom Sheet
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: GestureDetector(
              onVerticalDragEnd: (details) {
                if (details.primaryVelocity! > 0) {
                  // Drag down - minimize
                }
              },
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, -5),
                    ),
                  ],
                ),
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // Handle
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.borderGrey,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Nearest Safe Well
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Nearest Safe Well',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textGrey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.safeGreen.withAlpha((0.1 * 255).round()),
                                border: Border.all(
                                  color: AppColors.safeGreen,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.water_drop,
                                    color: AppColors.safeGreen,
                                    size: 32,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: const [
                                        Text(
                                          'Well ID: WL-001',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        SizedBox(height: 4),
                                        Text(
                                          'Distance: 2km | Depth: 35m',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: AppColors.textGrey,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Other Wells
                      Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Other Wells',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textGrey,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildWellCard(
                              title: 'Semi-Critical Well',
                              wellId: 'WL-002',
                              distance: '1.2km',
                              depth: '28m',
                              color: AppColors.warningYellow,
                            ),
                            const SizedBox(height: 8),
                            _buildWellCard(
                              title: 'Critical Well',
                              wellId: 'WL-003',
                              distance: '0.5km',
                              depth: '15m',
                              color: Colors.red,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showWellDetails(WellMarker well) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        well.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'ID: ${well.wellId}',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: well.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: well.color),
                    ),
                    child: Text(
                      well.status.toUpperCase(),
                      style: TextStyle(
                        color: well.color,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                   Expanded(
                     child: _buildDetailItem(Icons.water_drop, 'Depth', well.depth),
                   ),
                   Expanded(
                     child: _buildDetailItem(Icons.nature, 'Region', 'North'),
                   ),
                ],
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context); // Close sheet
                     Navigator.of(context).popUntil((route) => route.isFirst); // Go to Home
                     // This is a hacky way to try to switch tabs, better to just push the screen for now
                     // Provider.of<NavigationProvider>(context, listen: false).setTab(3); 
                     
                     // Simpler approach: Show a SnackBar saying "Go to Analysis Tab" or push the screen
                     // Pushing AnalysisScreen directly
                     // We need to fix imports first, but assuming we can:
                     // Navigator.push(context, MaterialPageRoute(builder: (_) => const AnalysisScreen()));
                     
                     // For this interaction to be smooth, let's just show a message or valid navigation if imports allowed.
                     // We will assume the user manually goes there or implementing proper routing later.
                     // Let's just Push the Analysis Screen to be safe/clear.
                     Navigator.pushNamed(context, '/analysis'); 
                  },
                  icon: const Icon(Icons.analytics),
                  label: const Text('Predict Future Scenario'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.grey, size: 28),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }

  Widget _buildWellCard({
    required String title,
    required String wellId,
    required String distance,
    required String depth,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha((0.1 * 255).round()),
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.water_drop, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$wellId | $distance away | $depth deep',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textGrey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }
}

class WellMarker {
  final String id;
  final LatLng location;
  final String title;
  final String wellId;
  final String distance;
  final String depth;
  final String status;
  final Color color;

  WellMarker({
    required this.id,
    required this.location,
    required this.title,
    required this.wellId,
    required this.distance,
    required this.depth,
    required this.status,
    required this.color,
  });
}
