class User {
  final String userId;
  final String email;
  final String? name;
  final String? phoneNumber;
  final String areaOfInterest;
  final bool alertsEnabled;
  final List<String> alertSeverities;
  final DateTime createdAt;

  User({
    required this.userId,
    required this.email,
    this.name,
    this.phoneNumber,
    required this.areaOfInterest,
    this.alertsEnabled = true,
    this.alertSeverities = const ['MEDIUM', 'HIGH', 'CRITICAL'],
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      phoneNumber: json['phone_number'],
      areaOfInterest: json['area_of_interest'] ?? '',
      alertsEnabled: json['alerts_enabled'] ?? true,
      alertSeverities: List<String>.from(json['alert_severities'] ?? ['MEDIUM', 'HIGH', 'CRITICAL']),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': userId,
      'email': email,
      'name': name,
      'phone_number': phoneNumber,
      'area_of_interest': areaOfInterest,
      'alerts_enabled': alertsEnabled,
      'alert_severities': alertSeverities,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
