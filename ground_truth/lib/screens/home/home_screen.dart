import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/alert_provider.dart';
import 'farmer_home_screen.dart';
import 'jal_mitra_chat_screen.dart';
import 'map_nearby_screen.dart';
import '../analysis/analysis_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;


  final List<Widget> _screens = [
    const FarmerHomeScreen(),
    const JalMitraChatScreen(),
    const MapNearbyScreen(),
    const AnalysisScreen(),
  ];

  final List<String> _labels = ['Home', 'Advisory', 'Map', 'Analysis'];
  final List<IconData> _icons = [
    Icons.home_outlined,
    Icons.smart_toy_outlined,
    Icons.map_outlined,
    Icons.analytics_outlined,
  ];

  @override
  Widget build(BuildContext context) {
    final alertProvider = context.watch<AlertProvider>();

    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
        },
        items: List.generate(
          4,
          (index) => BottomNavigationBarItem(
            icon: Stack(
              children: [
                Icon(_icons[index]),
                if (index == 3 && alertProvider.alerts.isNotEmpty)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '${alertProvider.alerts.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            label: _labels[index],
          ),
        ),
      ),
    );
  }
}
             