import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/user_detail.dart';

import 'user_detail_controller.dart';
import 'package:rupu/presentation/widgets/image_preview_dialog.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';

class UserDetailView extends GetView<UserDetailController> {
  static const name = 'user-detail';
  final int userId;

  const UserDetailView({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          final detail = controller.user.value;
          return Text(detail?.name ?? 'Detalle de usuario');
        }),
        actions: [
          Obx(() {
            if (!controller.canDelete) return const SizedBox.shrink();
            return IconButton(
              tooltip: 'Eliminar usuario',
              onPressed: controller.isDeleting.value
                  ? null
                  : () async {
                      final confirmed = await _confirmDelete(context);
                      if (!confirmed || !context.mounted) return;
                      final result = await controller.deleteCurrentUser();
                      if (!context.mounted) return;
                      if (result.success) {
                        Navigator.of(context).pop(result);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              result.message ??
                                  'No se pudo eliminar el usuario.',
                            ),
                          ),
                        );
                      }
                    },
              icon: controller.isDeleting.value
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.delete_outline),
            );
          }),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.errorMessage.value != null &&
            controller.user.value == null) {
          return _ErrorPlaceholder(
            message: controller.errorMessage.value!,
            onRetry: controller.canRead
                ? () => controller.loadUser(userId)
                : null,
          );
        }

        final detail = controller.user.value;
        if (detail == null) {
          return _ErrorPlaceholder(
            message: 'No hay información disponible.',
            onRetry: controller.canRead
                ? () => controller.loadUser(userId)
                : null,
          );
        }

        return Form(
          key: controller.formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _HeaderSummary(detail: detail, controller: controller),
              const SizedBox(height: 24),
              if (detail.roles.isNotEmpty) ...[
                _SectionTitle('Roles asignados'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    for (final role in detail.roles)
                      Chip(
                        avatar: const Icon(Icons.security_outlined, size: 18),
                        label: Text(role.name),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
              if (detail.businesses.isNotEmpty) ...[
                _SectionTitle('Negocios asignados'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    for (final business in detail.businesses)
                      Chip(
                        avatar: const Icon(Icons.storefront_outlined, size: 18),
                        label: Text(business.name),
                      ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
              _SectionTitle('Información general'),
              const SizedBox(height: 12),
              _buildTextField(
                context,
                controller: controller.nameCtrl,
                label: 'Nombre',
                validator: (v) => (v == null || v.isEmpty) ? 'Requerido' : null,
                enabled: controller.canUpdate,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                context,
                controller: controller.emailCtrl,
                label: 'Email',
                validator: (v) => (v == null || v.isEmpty) ? 'Requerido' : null,
                enabled: controller.canUpdate,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                context,
                controller: controller.phoneCtrl,
                label: 'Teléfono',
                keyboardType: TextInputType.phone,
                enabled: controller.canUpdate,
              ),
              const SizedBox(height: 12),
              Obx(
                () => SwitchListTile.adaptive(
                  title: const Text('Activo'),
                  value: controller.isActive.value,
                  onChanged: controller.canUpdate
                      ? (v) => controller.isActive.value = v
                      : null,
                ),
              ),
              const SizedBox(height: 12),
              Obx(
                () => _BusinessSelectorField(
                  canEdit: controller.canUpdate,
                  selectedCount: controller.selectedBusinesses.length,
                  onTap: controller.canUpdate
                      ? () => _openBusinessPicker(context)
                      : null,
                ),
              ),
              const SizedBox(height: 8),
              Obx(() {
                final businesses = controller.selectedBusinesses;
                if (businesses.isEmpty) {
                  return Text(
                    'No hay negocios asignados. Usa el selector para agregarlos.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  );
                }
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: businesses
                      .map(
                        (business) => InputChip(
                          avatar: const Icon(
                            Icons.storefront_outlined,
                            size: 18,
                          ),
                          label: Text(business.name),
                          onDeleted: controller.canUpdate
                              ? () => controller.removeBusiness(business.id)
                              : null,
                        ),
                      )
                      .toList(),
                );
              }),
              const SizedBox(height: 12),
              _buildTextField(
                context,
                controller: controller.avatarUrlCtrl,
                label: 'URL de avatar',
                onChanged: controller.onAvatarUrlChanged,
                enabled:
                    controller.canUpdate && !controller.avatarProcessing.value,
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
                        : file?.fileName ?? 'Archivo de avatar',
                  ),
                  subtitle: processing
                      ? const Text('Comprimiendo archivo')
                      : file != null
                      ? Text(controller.formatFileSize(file.sizeInBytes))
                      : hasUrl
                      ? const Text('Se usará la URL proporcionada')
                      : const Text('Formatos permitidos: JPG, PNG, WEBP'),
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
                                tooltip: 'Eliminar archivo',
                                onPressed: controller.removeAvatarFile,
                                icon: const Icon(Icons.clear),
                              ),
                            IconButton(
                              tooltip: 'Tomar foto',
                              onPressed: (!controller.canUpdate || hasUrl)
                                  ? null
                                  : () => controller.pickAvatarFromCamera(),
                              icon: const Icon(Icons.photo_camera_outlined),
                            ),
                            IconButton(
                              tooltip: 'Seleccionar archivo',
                              onPressed: (!controller.canUpdate || hasUrl)
                                  ? null
                                  : () => controller.pickAvatar(),
                              icon: const Icon(Icons.attach_file),
                            ),
                          ],
                        ),
                  onTap: (!controller.canUpdate || hasUrl || processing)
                      ? null
                      : () => controller.pickAvatar(),
                );
              }),
              Obx(
                () => controller.avatarError.value != null
                    ? Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          controller.avatarError.value!,
                          style: Theme.of(
                            context,
                          ).textTheme.bodySmall?.copyWith(color: Colors.red),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),
              if (controller.errorMessage.value != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    controller.errorMessage.value!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              if (controller.canUpdate)
                Obx(
                  () => FilledButton(
                    onPressed: controller.isSaving.value
                        ? null
                        : () async {
                            final result = await controller.submit();
                            if (result == null || !context.mounted) return;
                            if (result.success) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    result.message ??
                                        'Usuario actualizado correctamente.',
                                  ),
                                ),
                              );
                            } else if (result.message != null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(result.message!)),
                              );
                            }
                          },
                    child: controller.isSaving.value
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Guardar cambios'),
                  ),
                ),
              if (!controller.canUpdate)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(12),
                    child: Text(
                      'Solo puedes visualizar la información de este usuario.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Future<bool> _confirmDelete(BuildContext context) async {
    return await DialogHelper.showBlurredDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Eliminar usuario'),
            content: const Text(
              'Esta acción eliminará el usuario de forma permanente.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(false),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(ctx).pop(true),
                style: FilledButton.styleFrom(
                  backgroundColor: Theme.of(ctx).colorScheme.error,
                  foregroundColor: Theme.of(ctx).colorScheme.onError,
                ),
                child: const Text('Eliminar'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Widget _buildTextField(
    BuildContext context, {
    required TextEditingController controller,
    required String label,
    TextInputType? keyboardType,
    bool enabled = true,
    String? helperText,
    String? Function(String?)? validator,
    bool obscureText = false,
    ValueChanged<String>? onChanged,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label, helperText: helperText),
      keyboardType: keyboardType,
      enabled: enabled,
      obscureText: obscureText,
      validator: validator,
      onChanged: onChanged,
    );
  }

  Future<void> _openBusinessPicker(BuildContext context) async {
    if (!controller.canUpdate) return;
    controller.businessSearchCtrl.clear();
    controller.searchBusinesses('');

    await DialogHelper.showBlurredDialog<void>(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.2),
      builder: (dialogCtx) => _BusinessPickerContent(controller: controller),
    );
  }
}

class _BusinessPickerContent extends StatelessWidget {
  final UserDetailController controller;

  const _BusinessPickerContent({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassContainer(
          width: 420,
          borderRadius: BorderRadius.circular(20),
          padding: const EdgeInsets.all(24),
          blur: 15,
          opacity: 0.85,
          child: Material(
            color: Colors.transparent,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Seleccionar negocios',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller.businessSearchCtrl,
                  textInputAction: TextInputAction.search,
                  decoration: InputDecoration(
                    labelText: 'Buscar negocio',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: () => controller.searchBusinesses(
                        controller.businessSearchCtrl.text,
                      ),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Theme.of(
                      context,
                    ).colorScheme.surface.withOpacity(0.5),
                  ),
                  onSubmitted: (value) => controller.searchBusinesses(value),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 320,
                  child: Obx(() {
                    final isLoading =
                        controller.businessSuggestionsLoading.value;
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
                              onPressed: () => controller.searchBusinesses(
                                controller.businessSearchCtrl.text,
                              ),
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      );
                    }
                    if (suggestions.isEmpty) {
                      return const Center(
                        child: Text(
                          'No se encontraron negocios con la búsqueda actual.',
                        ),
                      );
                    }
                    final selectedIds = controller.selectedBusinesses
                        .map((biz) => biz.id)
                        .toSet();
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
                              : () =>
                                    controller.addBusinessFromCatalog(business),
                        );
                      },
                    );
                  }),
                ),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cerrar'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BusinessSelectorField extends StatelessWidget {
  final bool canEdit;
  final int selectedCount;
  final VoidCallback? onTap;

  const _BusinessSelectorField({
    required this.canEdit,
    required this.selectedCount,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: canEdit ? onTap : null,
        leading: Icon(
          Icons.store_mall_directory_outlined,
          color: Theme.of(context).colorScheme.primary,
        ),
        title: Text('Negocios seleccionados: $selectedCount'),
        subtitle: Text(
          canEdit
              ? 'Toca para buscar y agregar negocios a este usuario.'
              : 'Solo lectura.',
        ),
        trailing: Icon(canEdit ? Icons.chevron_right : Icons.lock_outline),
      ),
    );
  }
}

class _HeaderSummary extends StatelessWidget {
  final UserDetail detail;
  final UserDetailController controller;

  const _HeaderSummary({required this.detail, required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    final avatarData = controller.avatarFile.value;
    final hasUrl = controller.hasAvatarUrl.value;
    final customUrl = controller.avatarUrlCtrl.text.trim();

    ImageProvider? imageProvider;
    if (avatarData != null) {
      imageProvider = FileImage(File(avatarData.path));
    } else if (hasUrl && customUrl.isNotEmpty) {
      imageProvider = NetworkImage(customUrl);
    } else if (detail.avatarUrl.isNotEmpty) {
      imageProvider = NetworkImage(detail.avatarUrl);
    }

    return GlassContainer(
      borderRadius: BorderRadius.circular(24),
      blur: 15,
      opacity: 0.6,
      border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            GestureDetector(
              onTap: imageProvider == null
                  ? null
                  : () => showImagePreviewDialog(
                      context,
                      imageProvider: imageProvider,
                      title: detail.name,
                    ),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: cs.primary.withValues(alpha: 0.2),
                    width: 2,
                  ),
                ),
                child: CircleAvatar(
                  radius: 36,
                  backgroundColor: cs.surfaceContainerHighest,
                  backgroundImage: imageProvider,
                  child: imageProvider == null
                      ? Text(
                          detail.name.isNotEmpty
                              ? detail.name.substring(0, 1).toUpperCase()
                              : '?',
                          style: tt.headlineMedium?.copyWith(
                            color: cs.onSurfaceVariant,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    detail.name,
                    style: tt.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    detail.email,
                    style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                  ),
                  if (detail.phone.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      detail.phone,
                      style: tt.bodySmall?.copyWith(
                        color: cs.onSurfaceVariant.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _StatusChip(
                        isActive: detail.isActive,
                        label: detail.isActive ? 'Activo' : 'Inactivo',
                      ),
                      if (detail.lastLoginAt != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest.withValues(
                              alpha: 0.5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.schedule_outlined,
                                size: 14,
                                color: cs.onSurfaceVariant,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                dateFormat.format(
                                  detail.lastLoginAt!.toLocal(),
                                ),
                                style: tt.labelSmall?.copyWith(
                                  color: cs.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final bool isActive;
  final String label;

  const _StatusChip({required this.isActive, required this.label});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = isActive ? Colors.green : cs.error;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isActive ? Icons.check_circle_outline : Icons.cancel_outlined,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Text(
      text,
      style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
    );
  }
}

class _ErrorPlaceholder extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const _ErrorPlaceholder({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_off_outlined, size: 48, color: cs.error),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
