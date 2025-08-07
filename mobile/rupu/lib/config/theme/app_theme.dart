// lib/config/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppTheme {
  AppTheme._();
  static final AppTheme instance = AppTheme._();

  late Color primaryColor = const Color.fromARGB(255, 2, 22, 153);
  late Color secondaryColor = const Color.fromARGB(255, 59, 130, 246);

  /// Tema “claro” dinámico
  ThemeData get lightTheme => ThemeData(
    brightness: Brightness.light,
    colorSchemeSeed: primaryColor,
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: secondaryColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: secondaryColor,
        foregroundColor: Colors.white,
      ),
    ),
  );

  /// Tema “oscuro” dinámico
  ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    colorSchemeSeed: primaryColor,
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      backgroundColor: primaryColor.withValues(alpha: 0.5),
      foregroundColor: Colors.white,
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: secondaryColor.withValues(alpha: 0.8),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: secondaryColor.withValues(alpha: 0.8),
        foregroundColor: Colors.white,
      ),
    ),
  );

  void updateColors(String primaryHex, String secondaryHex) {
    primaryColor = _hexToColor(primaryHex);
    secondaryColor = _hexToColor(secondaryHex);
    // Aplique cambios inmediatos al tema actual
    final newTheme = Get.isDarkMode ? darkTheme : lightTheme;
    Get.changeTheme(newTheme);
  }

  Color _hexToColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) hexColor = 'FF$hexColor';
    return Color(int.parse(hexColor, radix: 16));
  }
}
