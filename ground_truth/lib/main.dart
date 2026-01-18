import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'services/api_service.dart';
import 'services/alert_polling_service.dart';
import 'services/location_service.dart';
import 'services/fcm_service.dart';
import 'providers/auth_provider.dart';
import 'providers/alert_provider.dart';
import 'providers/location_provider.dart';
import 'providers/station_provider.dart';
import 'utils/theme.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set up error handling
  FlutterError.onError = (FlutterErrorDetails details) {
    print('Flutter Error: ${details.exceptionAsString()}');
  };

  // Initialize Firebase
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    print('Firebase initialization error: $e');
  }

  // Initialize FCM Service for background token refresh
  try {
    final fcmService = FCMService();
    await fcmService.initialize();
  } catch (e) {
    print('FCM Service initialization error: $e');
  }

  runApp(const GroundTruthApp());
}

class GroundTruthApp extends StatelessWidget {
  const GroundTruthApp({super.key});

  static final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = 
      GlobalKey<ScaffoldMessengerState>();

  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();

    return MultiProvider(
      providers: [
        // Services
        Provider<ApiService>(create: (_) => apiService),
        Provider<AlertPollingService>(
          create: (_) => AlertPollingService(apiService: apiService),
        ),
        Provider<LocationService>(
          create: (_) => LocationService(),
        ),

        // Providers
        ChangeNotifierProvider(
          create: (_) => AuthProvider(apiService: apiService),
        ),
        ChangeNotifierProvider(
          create: (context) {
            final provider = AlertProvider(
              pollingService: context.read<AlertPollingService>(),
            );
            WidgetsBinding.instance.addPostFrameCallback((_) {
              provider.setScaffoldKey(scaffoldMessengerKey);
            });
            return provider;
          },
        ),
        ChangeNotifierProvider(
          create: (context) => LocationProvider(
            locationService: context.read<LocationService>(),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => StationProvider(),
        ),
      ],
      child: Builder(
        builder: (context) {
          return MaterialApp(
            scaffoldMessengerKey: scaffoldMessengerKey,
            title: 'GroundTruth',
            theme: AppTheme.lightTheme,
            debugShowCheckedModeBanner: false,
            home: _buildHome(),
            routes: {
              '/home': (_) => const HomeScreen(),
              '/login': (_) => const LoginScreen(),
              '/settings': (_) => const SettingsScreen(),
              '/signup': (_) => const SignupScreen(),
            },
          );
        },
      ),
    );
  }

  Widget _buildHome() {
    // TEMPORARY: Bypass authentication for testing
    return const HomeScreen();
    
    /* Uncomment below to re-enable authentication
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        // Show loading screen during initialization
        if (authProvider.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (authProvider.isLoggedIn) {
          return const HomeScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
    */
  }
}

// Placeholder screens
class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign Up')),
      body: const Center(child: Text('Sign Up Screen - Coming Soon')),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Notifications'),
            trailing: Switch(value: true, onChanged: (_) {}),
          ),
          ListTile(
            title: const Text('Language'),
            subtitle: const Text('English'),
            onTap: () {},
          ),
          ListTile(
            title: const Text('About'),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Logout'),
            onTap: () {
              context.read<AuthProvider>().logout();
              Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
        ],
      ),
    );
  }
}
