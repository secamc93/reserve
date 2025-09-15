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
              onChanged: controller.onAvatarUrlChanged,
            ),
            const SizedBox(height: 12),
            Obx(() {
              final processing = controller.avatarProcessing.value;
              final file = controller.avatarFile.value;
              final hasUrl = controller.hasAvatarUrl.value;
              return ListTile(
                title: Text(
                  processing
                      ? 'Procesando imagen...'
                      : file?.fileName ?? 'Seleccionar archivo de avatar',
                ),
                subtitle: processing
                    ? const Text('Comprimiendo archivo')
                    : file != null
                        ? Text(controller.formatFileSize(file.sizeInBytes))
                        : hasUrl
                            ? const Text('Usando URL proporcionada')
                            : const Text('Formatos compatibles: JPG, PNG'),
                trailing: processing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (file != null)
                            IconButton(
                              icon: const Icon(Icons.clear),
                              tooltip: 'Eliminar archivo',
                              onPressed: controller.removeAvatarFile,
                            ),
                          const Icon(Icons.attach_file),
                        ],
                      ),
                onTap: processing || hasUrl ? null : controller.pickAvatar,
              );
            }),
            Obx(() => controller.avatarError.value != null
                ? Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      controller.avatarError.value!,
                      style: tt.bodySmall!.copyWith(color: Colors.red),
                    ),
                  )
                : const SizedBox.shrink()),
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
