import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors (Astonishing Palette)
  static const Color primaryBlue = Color(0xFF005792); // Deep Blue
  static const Color accentCyan = Color(0xFF53CDE2);  // Cyan/Teal
  static const Color softBlue = Color(0xFFD1F4FA);    // Very Light Blue
  static const Color backgroundLight = Color(0xFFEDF9FC); // Almost White
  
  static const Color waterBlue = accentCyan; // Mapping for compatibility
  static const Color lightBlue = softBlue;   // Mapping for compatibility

  // Status Colors (Vibrant)
  static const Color safeGreen = Color(0xFF00C853);
  static const Color warningYellow = Color(0xFFFFB300);
  static const Color criticalRed = Color(0xFFFF1744);

  // Zone Classification
  static const Color zoneSafe = safeGreen;
  static const Color zoneSemiCritical = warningYellow;
  static const Color zoneCritical = criticalRed;

  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF102027); // Softer black
  static const Color darkGrey = Color(0xFF37474F);
  static const Color lightGrey = Color(0xFFCFD8DC);
  static const Color borderGrey = Color(0xFFB0BEC5);
  static const Color textGrey = Color(0xFF546E7A);

  // Semantic Colors
  static const Color success = safeGreen;
  static const Color warning = warningYellow;
  static const Color error = criticalRed;
  static const Color info = primaryBlue;

  // Backgrounds
  static const Color backgroundColor = backgroundLight;
  static const Color cardBackground = white;
  static const Color shadowColor = Color(0x1A005792); // Blue-tinted shadow
}
