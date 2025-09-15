// presentation/views/settings/create_user_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/create_user_controller.dart';

class CreateUserView extends GetView<CreateUserController> {
  static const name = 'create-user';
  const CreateUserView({super.key});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Crear usuario')),
      body: Form(
        key: controller.formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: controller.nameCtrl,
              decoration: const InputDecoration(labelText: 'Nombre'),
              validator: (v) => (v == null || v.isEmpty) ? 'Requerido' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.emailCtrl,
              decoration: const InputDecoration(labelText: 'Email'),
              validator: (v) => (v == null || v.isEmpty) ? 'Requerido' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.phoneCtrl,
              decoration: const InputDecoration(labelText: 'Teléfono'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            Obx(() => SwitchListTile(
                  title: const Text('Activo'),
                  value: controller.isActive.value,
                  onChanged: (v) => controller.isActive.value = v,
                )),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.roleIdsCtrl,
              decoration:
                  const InputDecoration(labelText: 'IDs de roles (comma sep)'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.businessIdsCtrl,
              decoration: const InputDecoration(
                  labelText: 'IDs de negocios (comma sep)'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.avatarUrlCtrl,
              decoration: const InputDecoration(labelText: 'URL de avatar'),
            ),
            const SizedBox(height: 12),
            Obx(() => ListTile(
                  title: Text(controller.avatarFile.value?.name ??
                      'Seleccionar archivo de avatar'),
                  trailing: const Icon(Icons.attach_file),
                  onTap: controller.pickAvatar,
                )),
            const SizedBox(height: 24),
            Obx(() => ElevatedButton(
                  onPressed: controller.isSubmitting.value
                      ? null
                      : () async {
                          final ok = await controller.submit();
                          if (ok && context.mounted) {
                            Get.back();
                          }
                        },
                  child: controller.isSubmitting.value
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Guardar'),
                )),
            const SizedBox(height: 8),
            Obx(() => controller.errorMessage.value != null
                ? Text(
                    controller.errorMessage.value!,
                    style: tt.bodySmall!.copyWith(color: Colors.red),
                  )
                : const SizedBox.shrink()),
          ],
        ),
      ),
    );
  }
}
