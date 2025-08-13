// lib/config/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppTheme {
  AppTheme._();
  static final AppTheme instance = AppTheme._();

  late Color primaryColor = const Color(0xFF021699);
  late Color secondaryColor = const Color(0xFF3B82F6);

  ThemeData get lightTheme {
    final baseScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
    );

    // ⬇️ Alinea el FAB con tu color secundario
    final scheme = baseScheme.copyWith(
      secondaryContainer: secondaryColor,
      onSecondaryContainer: Colors.white,
    );

    return ThemeData(
      brightness: Brightness.light,
      colorScheme: scheme,
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: scheme.secondaryContainer,
        foregroundColor: scheme.onSecondaryContainer,
        // Si tu versión de Flutter lo soporta:
        // extendedTextStyle: TextStyle(
        //   color: scheme.onSecondaryContainer,
        //   fontWeight: FontWeight.w700,
        // ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: secondaryColor,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  ThemeData get darkTheme {
    final baseScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.dark,
    );

    final scheme = baseScheme.copyWith(
      secondaryContainer: secondaryColor.withOpacity(0.95),
      onSecondaryContainer: Colors.white,
    );

    return ThemeData(
      brightness: Brightness.dark,
      colorScheme: scheme,
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryColor.withOpacity(0.5),
        foregroundColor: Colors.white,
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: scheme.secondaryContainer,
        foregroundColor: scheme.onSecondaryContainer,
        // extendedTextStyle: TextStyle(
        //   color: scheme.onSecondaryContainer,
        //   fontWeight: FontWeight.w700,
        // ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: secondaryColor.withOpacity(0.95),
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  void updateColors(String primaryHex, String secondaryHex) {
    primaryColor = _hexToColor(primaryHex);
    secondaryColor = _hexToColor(secondaryHex);
    final newTheme = Get.isDarkMode ? darkTheme : lightTheme;
    Get.changeTheme(newTheme);
  }

  Color _hexToColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) hexColor = 'FF$hexColor';
    return Color(int.parse(hexColor, radix: 16));
  }
}
