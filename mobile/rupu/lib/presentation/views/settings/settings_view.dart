// presentation/views/settings/settings_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'settings_controller.dart';

class SettingsView extends GetView<SettingsController> {
  static const name = 'settings-screen';
  final int pageIndex;
  const SettingsView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        children: [
          Obx(() {
            final isDark = controller.isDarkRx.value;
            return SwitchListTile.adaptive(
              title: Text(isDark ? 'Modo Oscuro' : 'Modo Claro'),
              secondary: Icon(isDark ? Icons.nights_stay : Icons.wb_sunny),
              value: isDark,
              onChanged: (_) => controller.toggleTheme(),
            );
          }),
          if (controller.isAdmin)
            ListTile(
              leading: const Icon(Icons.person_add),
              title: const Text('Crear usuario'),
              onTap: () => controller.goToCreateUser(context, pageIndex),
            ),
        ],
      ),
    );
  }
}
