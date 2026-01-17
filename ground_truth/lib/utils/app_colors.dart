import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors (Aqua-Tech Modern)
  static const Color primaryBlue = Color(0xFF1A3C5E);
  static const Color waterBlue = Color(0xFF3498DB);
  static const Color lightBlue = Color(0xFFE3F2FD);

  // Status Colors
  static const Color safeGreen = Color(0xFF1ABC9C);
  static const Color warningYellow = Color(0xFFF39C12);
  static const Color criticalRed = Color(0xFFE74C3C);

  // Zone Classification
  static const Color zoneSafe = safeGreen;
  static const Color zoneSemiCritical = warningYellow;
  static const Color zoneCritical = criticalRed;

  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color darkGrey = Color(0xFF2C3E50);
  static const Color lightGrey = Color(0xFFF5F6FA);
  static const Color borderGrey = Color(0xFFECF0F1);
  static const Color textGrey = Color(0xFF7F8C8D);

  // Semantic Colors
  static const Color success = safeGreen;
  static const Color warning = warningYellow;
  static const Color error = criticalRed;
  static const Color info = waterBlue;

  // Backgrounds
  static const Color backgroundColor = Color(0xFFFAFBFC);
  static const Color cardBackground = white;
  static const Color shadowColor = Color(0x0D000000);
}
