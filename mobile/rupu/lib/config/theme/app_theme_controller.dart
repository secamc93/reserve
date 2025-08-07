// lib/config/theme/theme_controller.dart
import 'package:get/get.dart';
import 'package:flutter/material.dart';

class AppThemeController extends GetxController {
  /// Rx que guarda el modo actual
  final isDark = false.obs;

  @override
  void onInit() {
    // Inicializamos con el estado de Get (por si guardas preferencia)
    isDark.value = Get.isDarkMode;
    super.onInit();
  }

  void toggleTheme() {
    isDark.toggle(); // cambia de true a false o viceversa
    Get.changeThemeMode(isDark.value ? ThemeMode.dark : ThemeMode.light);
  }
}
