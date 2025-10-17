import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'roles_permissions_controller.dart';

class RolesPermissionsView extends GetView<RolesPermissionsController> {
  static const name = 'roles-permissions';
  final int pageIndex;

  const RolesPermissionsView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Usuarios y permisos'),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Obx(() {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.admin_panel_settings_outlined, size: 64),
                const SizedBox(height: 16),
                Text(
                  controller.description.value,
                  textAlign: TextAlign.center,
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
