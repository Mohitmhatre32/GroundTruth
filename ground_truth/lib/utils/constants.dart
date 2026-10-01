class AppConstants {
  // API Configuration
  // API Configuration
  // For Physical Device: 192.168.1.104 detected.
  static const String apiBaseUrl = 'http://localhost:8000/api'; 
  static const int apiTimeoutSeconds = 30;
  static const String geminiApiKey = 'Your API key here'; 

  // Auth
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';

  // Polling
  static const Duration alertPollingInterval = Duration(seconds: 15);
  static const Duration locationUpdateInterval = Duration(seconds: 10);

  // Zones
  static const Map<String, String> zoneColors = {
    'SAFE': 'Green',
    'SEMI_CRITICAL': 'Yellow',
    'CRITICAL': 'Red',
  };

  // Alert Severity
  static const List<String> alertSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Error Messages
  static const String networkError = 'Network error. Please check your connection.';
  static const String unauthorizedError = 'Unauthorized. Please login again.';
  static const String serverError = 'Server error. Please try again later.';
  static const String validationError = 'Please fill all required fields.';

  // Limits
  static const int maxRecentAlerts = 50;
  static const int maxVerifications = 100;
  static const int maxExportRecords = 1000;

  // Cache Duration
  static const Duration cacheDuration = Duration(minutes: 5);

  // UI
  static const double borderRadius = 12.0;
  static const double spacing = 16.0;
  static const double smallSpacing = 8.0;
  static const double largeSpacing = 24.0;

  // Zone Threshold (in meters)
  static const double criticalThreshold = 5.0;
  static const double warningThreshold = 3.0;
}

class AppStrings {
  // Navigation
  static const String dashboard = 'Dashboard';
  static const String alerts = 'Alerts';
  static const String fieldUpdates = 'Field Updates';
  static const String share = 'Share';
  static const String settings = 'Settings';

  // Dashboard
  static const String realtimeMonitoring = 'Real-Time Monitoring';
  static const String currentLevel = 'Current Level';
  static const String status = 'Status';
  static const String nearestStation = 'Nearest Station';
  static const String zoneTap = 'Zone Classification';

  // Alerts
  static const String activeAlerts = 'Active Alerts';
  static const String noAlerts = 'No active alerts';
  static const String acknowledgeAlert = 'Acknowledge Alert';
  static const String alertDetails = 'Alert Details';

  // Field Updates
  static const String submitVerification = 'Submit Verification';
  static const String manualReading = 'Manual Reading';
  static const String capturePhoto = 'Capture Photo';
  static const String selectPhoto = 'Select Photo';
  static const String notes = 'Notes';
  static const String submitted = 'Submitted';

  // Export
  static const String exportData = 'Export Data';
  static const String selectFormat = 'Select Format';
  static const String dateRange = 'Date Range';
  static const String generateReport = 'Generate Report';
  static const String shareViaWhatsApp = 'Share via WhatsApp';
  static const String shareViaEmail = 'Share via Email';

  // Auth
  static const String login = 'Login';
  static const String signup = 'Sign Up';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String forgotPassword = 'Forgot Password?';
  static const String rememberMe = 'Remember Me';
  static const String logout = 'Logout';

  // General
  static const String loading = 'Loading...';
  static const String error = 'Error';
  static const String success = 'Success';
  static const String save = 'Save';
  static const String cancel = 'Cancel';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
  static const String next = 'Next';
  static const String back = 'Back';
  static const String submit = 'Submit';
  static const String retry = 'Retry';
}
