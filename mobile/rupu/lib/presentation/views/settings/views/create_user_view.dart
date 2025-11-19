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
            Obx(
              () => _BusinessSelectorField(
                selectedCount: controller.selectedBusinesses.length,
                onTap: () => _openBusinessPicker(context, controller),
              ),
            ),
            const SizedBox(height: 8),
            Obx(() {
              final businesses = controller.selectedBusinesses;
              if (businesses.isEmpty) {
                return Text(
                  'No hay negocios asignados. Usa el selector para agregarlos.',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
                );
              }
              return Wrap(
                spacing: 8,
                runSpacing: 8,
                children: businesses
                    .map(
                      (business) => InputChip(
                        avatar: const Icon(Icons.storefront_outlined, size: 18),
                        label: Text(business.name),
                        onDeleted: () => controller.removeBusiness(business.id),
                      ),
                    )
                    .toList(),
              );
            }),
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
                        if (!context.mounted) return;
                        if (result != null) {
                          await _showSuccessDialog(context, result);
                          if (!context.mounted) return;
                          GoRouter.of(context).pop(true);
                        } else {
                          final message = controller.errorMessage.value;
                          if (message != null) {
                            await _showErrorDialog(context, message);
                          }
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

Future<void> _showErrorDialog(BuildContext context, String message) async {
  await showDialog<void>(
    context: context,
    builder: (dialogCtx) {
      return AlertDialog(
        title: const Text('No se pudo crear el usuario'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Entendido'),
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
                        cs.primary.withValues(alpha: .14),
                        cs.secondary.withValues(alpha: .12),
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

Future<void> _openBusinessPicker(
  BuildContext context,
  CreateUserController controller,
) async {
  await controller.searchBusinesses('');
  final searchCtrl = TextEditingController();
  await showDialog<void>(
    context: context,
    builder: (dialogCtx) {
      return AlertDialog(
        title: const Text('Seleccionar negocios'),
        content: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: searchCtrl,
                textInputAction: TextInputAction.search,
                decoration: InputDecoration(
                  labelText: 'Buscar negocio',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: () => controller.searchBusinesses(searchCtrl.text),
                  ),
                ),
                onSubmitted: (value) => controller.searchBusinesses(value),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 320,
                child: Obx(() {
                  final isLoading = controller.businessSuggestionsLoading.value;
                  final error = controller.businessSuggestionsError.value;
                  final suggestions = controller.businessSuggestions;
                  if (isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (error != null) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(error, textAlign: TextAlign.center),
                          const SizedBox(height: 8),
                          FilledButton.tonal(
                            onPressed: () => controller.searchBusinesses(searchCtrl.text),
                            child: const Text('Reintentar'),
                          ),
                        ],
                      ),
                    );
                  }
                  if (suggestions.isEmpty) {
                    return const Center(
                      child: Text('No se encontraron negocios con la búsqueda actual.'),
                    );
                  }
                  final selectedIds =
                      controller.selectedBusinesses.map((biz) => biz.id).toSet();
                  return ListView.separated(
                    itemCount: suggestions.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, index) {
                      final business = suggestions[index];
                      final isSelected = selectedIds.contains(business.id);
                      return ListTile(
                        enabled: !isSelected,
                        leading: CircleAvatar(
                          child: Text(
                            business.name.isNotEmpty
                                ? business.name.substring(0, 1).toUpperCase()
                                : '?',
                          ),
                        ),
                        title: Text(business.name),
                        subtitle: Text(
                          business.businessType.isEmpty
                              ? 'Sin tipo registrado'
                              : business.businessType,
                        ),
                        trailing: Icon(
                          isSelected
                              ? Icons.check_circle
                              : Icons.add_circle_outline,
                          color: isSelected
                              ? Theme.of(context).colorScheme.secondary
                              : Theme.of(context).colorScheme.primary,
                        ),
                        onTap: isSelected
                            ? null
                            : () => controller.addBusinessFromCatalog(business),
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Cerrar'),
          ),
        ],
      );
    },
  );
  searchCtrl.dispose();
}

class _BusinessSelectorField extends StatelessWidget {
  final int selectedCount;
  final VoidCallback onTap;

  const _BusinessSelectorField({
    required this.selectedCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Icon(
          Icons.store_mall_directory_outlined,
          color: Theme.of(context).colorScheme.primary,
        ),
        title: Text('Negocios seleccionados: $selectedCount'),
        subtitle: const Text('Toca para buscar y asignar negocios al usuario.'),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
