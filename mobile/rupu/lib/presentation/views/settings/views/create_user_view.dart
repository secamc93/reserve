// presentation/views/settings/create_user_view.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/domain/entities/create_user_result.dart';
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
            Obx(
              () => SwitchListTile(
                title: const Text('Activo'),
                value: controller.isActive.value,
                onChanged: (v) => controller.isActive.value = v,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.roleIdsCtrl,
              decoration: const InputDecoration(
                labelText: 'IDs de roles (comma sep)',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: controller.businessIdsCtrl,
              decoration: const InputDecoration(
                labelText: 'IDs de negocios (comma sep)',
              ),
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
              final cs = Theme.of(context).colorScheme;

              return ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                title: Text(
                  processing
                      ? 'Procesando imagen...'
                      : file?.fileName ?? 'Foto de avatar',
                ),
                subtitle: processing
                    ? const Text('Comprimiendo archivo')
                    : file != null
                    ? Text(controller.formatFileSize(file.sizeInBytes))
                    : hasUrl
                    ? const Text('Usando URL proporcionada')
                    : const Text('Formatos: JPG, PNG, WEBP'),
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
                          IconButton(
                            tooltip: 'Tomar foto',
                            onPressed: (processing || hasUrl)
                                ? null
                                : () => controller.pickAvatarFromCamera(),
                            icon: const Icon(Icons.photo_camera_outlined),
                          ),
                          IconButton(
                            tooltip: 'Seleccionar archivo',
                            onPressed: (processing || hasUrl)
                                ? null
                                : () => _showAvatarSourceSheet(
                                    context,
                                    controller,
                                  ),
                            icon: const Icon(Icons.attach_file),
                          ),
                        ],
                      ),
                onTap: (processing || hasUrl)
                    ? null
                    : () => _showAvatarSourceSheet(context, controller),
              );
            }),
            Obx(
              () => controller.avatarError.value != null
                  ? Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        controller.avatarError.value!,
                        style: tt.bodySmall!.copyWith(color: Colors.red),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
            const SizedBox(height: 24),
            Obx(
              () => ElevatedButton(
                onPressed: controller.isSubmitting.value
                    ? null
                    : () async {
                        final result = await controller.submit();
                        if (result != null && context.mounted) {
                          await _showSuccessDialog(context, result);
                          if (!context.mounted) return;
                          GoRouter.of(context).pop(true);
                        }
                      },
                child: controller.isSubmitting.value
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Guardar'),
              ),
            ),
            const SizedBox(height: 8),
            Obx(
              () => controller.errorMessage.value != null
                  ? Text(
                      controller.errorMessage.value!,
                      style: tt.bodySmall!.copyWith(color: Colors.red),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> _showSuccessDialog(
  BuildContext context,
  CreateUserResult result,
) async {
  await showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (dialogCtx) {
      return AlertDialog(
        title: const Text('Usuario creado'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result.message ?? 'El usuario se creó correctamente.'),
            const SizedBox(height: 12),
            SelectableText('Email: ${result.email}'),
            const SizedBox(height: 8),
            SelectableText(
              result.password != null && result.password!.isNotEmpty
                  ? 'Contraseña temporal: ${result.password}'
                  : 'No se recibió una contraseña temporal.',
            ),
          ],
        ),
        actions: [
          if (result.password != null && result.password!.isNotEmpty)
            TextButton.icon(
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: result.password!));
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Contraseña copiada al portapapeles'),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.copy_all_outlined),
              label: const Text('Copiar contraseña'),
            ),
          FilledButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Continuar'),
          ),
        ],
      );
    },
  );
}

Future<void> _showAvatarSourceSheet(
  BuildContext context,
  CreateUserController controller,
) async {
  final cs = Theme.of(context).colorScheme;
  final tt = Theme.of(context).textTheme;

  await showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
    ),
    builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        cs.primary.withOpacity(.14),
                        cs.secondary.withOpacity(.12),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Icon(Icons.image_outlined, color: cs.primary),
                ),
                const SizedBox(width: 10),
                Text(
                  'Foto de perfil',
                  style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Tomar foto con la cámara'),
              onTap: () async {
                Navigator.of(ctx).pop();
                await controller.pickAvatarFromCamera();
              },
            ),
            ListTile(
              leading: const Icon(Icons.attach_file),
              title: const Text('Seleccionar archivo de la galería'),
              onTap: () async {
                Navigator.of(ctx).pop();
                await controller
                    .pickAvatar(); // tu método existente (FilePicker)
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      );
    },
  );
}
