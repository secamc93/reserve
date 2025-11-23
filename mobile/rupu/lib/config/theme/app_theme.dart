// lib/config/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppTheme {
  AppTheme._();
  static final AppTheme instance = AppTheme._();

  late Color primaryColor = const Color(0xFF021699);
  late Color secondaryColor = const Color(0xFF3B82F6);
  late Color tertiaryColor = const Color(0xFF0EA5E9);
  late Color quaternaryColor = const Color(0xFF22C55E);

  ThemeData get lightTheme {
    final scheme = _buildColorScheme(Brightness.light);

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
    final scheme = _buildColorScheme(Brightness.dark);

    return ThemeData(
      brightness: Brightness.dark,
      colorScheme: scheme,
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryColor.withValues(alpha: 0.5),
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
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return secondaryColor; // thumb activo
          }
          return null; // usa por defecto
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return secondaryColor.withValues(alpha: .35); // track activo
          }
          return null;
        }),
        // Opcional M3:
        // trackOutlineColor: MaterialStateProperty.all(Colors.transparent),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: secondaryColor.withValues(alpha: 0.95),
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  ColorScheme _buildColorScheme(Brightness brightness) {
    final baseScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: brightness,
    );

    return baseScheme.copyWith(
      secondary: secondaryColor,
      secondaryContainer: secondaryColor.withValues(alpha: brightness == Brightness.dark ? .95 : 1),
      onSecondaryContainer: Colors.white,
      tertiary: tertiaryColor,
      tertiaryContainer: tertiaryColor.withValues(alpha: .9),
      onTertiaryContainer: Colors.white,
      surfaceTint: quaternaryColor,
      outlineVariant: quaternaryColor.withValues(alpha: .25),
    );
  }

  void updateColors(
    String primaryHex,
    String secondaryHex,
    String tertiaryHex,
    String quaternaryHex,
  ) {
    primaryColor = _hexToColor(primaryHex);
    secondaryColor = _hexToColor(secondaryHex);
    tertiaryColor = _hexToColor(tertiaryHex);
    quaternaryColor = _hexToColor(quaternaryHex);
    final newTheme = Get.isDarkMode ? darkTheme : lightTheme;
    Get.changeTheme(newTheme);
  }

  Color _hexToColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) hexColor = 'FF$hexColor';
    return Color(int.parse(hexColor, radix: 16));
  }
}
