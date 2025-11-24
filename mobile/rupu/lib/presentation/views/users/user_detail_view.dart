import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'user_detail_controller.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'widgets/user_detail_widgets.dart';
import 'widgets/user_detail_avatar_section.dart';

class UserDetailView extends GetView<UserDetailController> {
  static const name = 'user-detail';
  final int userId;

  const UserDetailView({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: cs.onPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
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
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(cs.onPrimary),
                      ),
                    )
                  : Icon(Icons.delete_outline, color: cs.onPrimary),
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

        final tt = Theme.of(context).textTheme;

        return Form(
          key: controller.formKey,
          child: Stack(
            children: [
              // Gradient header background
              Container(
                height: 200,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [cs.primary, cs.secondary.withValues(alpha: 0.9)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),

              // Main content
              CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  // Spacing for AppBar
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: MediaQuery.of(context).padding.top + 60,
                    ),
                  ),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        children: [
                          // Avatar Section
                          UserDetailAvatarSection(
                            controller: controller,
                            userName: detail.name,
                            existingAvatarUrl: detail.avatarUrl,
                          ),

                          const SizedBox(height: 24),

                          // Form Section
                          SectionContainer(
                            title: 'Información general',
                            children: [
                              // Name field
                              StyledFormField(
                                controller: controller.nameCtrl,
                                label: 'Nombre',
                                icon: Icons.person_outline,
                                enabled: controller.canUpdate,
                                validator: (v) => (v == null || v.isEmpty)
                                    ? 'Requerido'
                                    : null,
                              ),

                              const SizedBox(height: 12),

                              // Email field
                              StyledFormField(
                                controller: controller.emailCtrl,
                                label: 'Email',
                                icon: Icons.email_outlined,
                                enabled: controller.canUpdate,
                                keyboardType: TextInputType.emailAddress,
                                validator: (v) => (v == null || v.isEmpty)
                                    ? 'Requerido'
                                    : null,
                              ),

                              const SizedBox(height: 12),

                              // Phone field
                              StyledFormField(
                                controller: controller.phoneCtrl,
                                label: 'Teléfono',
                                icon: Icons.phone_outlined,
                                enabled: controller.canUpdate,
                                keyboardType: TextInputType.phone,
                              ),

                              const SizedBox(height: 12),

                              // Avatar URL field
                              StyledFormField(
                                controller: controller.avatarUrlCtrl,
                                label: 'URL de avatar',
                                icon: Icons.link,
                                enabled:
                                    controller.canUpdate &&
                                    !controller.avatarProcessing.value,
                                onChanged: controller.onAvatarUrlChanged,
                              ),

                              const SizedBox(height: 16),

                              // Active toggle
                              Obx(
                                () => Container(
                                  decoration: BoxDecoration(
                                    color: cs.surfaceContainerHighest
                                        .withValues(alpha: 0.3),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: SwitchListTile.adaptive(
                                    title: Row(
                                      children: [
                                        Icon(
                                          Icons.power_settings_new,
                                          size: 22,
                                          color: cs.primary,
                                        ),
                                        const SizedBox(width: 12),
                                        const Text('Usuario activo'),
                                      ],
                                    ),
                                    value: controller.isActive.value,
                                    onChanged: controller.canUpdate
                                        ? (v) => controller.isActive.value = v
                                        : null,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 16),

                              // Business selector
                              Obx(
                                () => BusinessSelectorTile(
                                  selectedCount:
                                      controller.selectedBusinesses.length,
                                  onTap: () => _openBusinessPicker(context),
                                  enabled: controller.canUpdate,
                                ),
                              ),

                              // Selected businesses chips
                              Obx(() {
                                final businesses =
                                    controller.selectedBusinesses;
                                if (businesses.isEmpty) {
                                  return const SizedBox(height: 8);
                                }

                                return Padding(
                                  padding: const EdgeInsets.only(top: 12),
                                  child: Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: businesses
                                        .map(
                                          (business) => InputChip(
                                            label: Text(business.name),
                                            avatar: Icon(
                                              Icons.storefront_outlined,
                                              size: 18,
                                              color: cs.primary,
                                            ),
                                            onDeleted: controller.canUpdate
                                                ? () =>
                                                      controller.removeBusiness(
                                                        business.id,
                                                      )
                                                : null,
                                            backgroundColor: cs.primaryContainer
                                                .withValues(alpha: 0.5),
                                            deleteIconColor: cs.error,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                        )
                                        .toList(),
                                  ),
                                );
                              }),

                              const SizedBox(height: 20),

                              // Error message
                              if (controller.errorMessage.value != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: cs.errorContainer,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.error_outline,
                                          color: cs.error,
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            controller.errorMessage.value!,
                                            style: tt.bodyMedium?.copyWith(
                                              color: cs.onErrorContainer,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),

                              // Save button
                              if (controller.canUpdate)
                                Obx(
                                  () => SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: controller.isSaving.value
                                          ? null
                                          : () async {
                                              final result = await controller
                                                  .submit();
                                              if (result == null ||
                                                  !context.mounted)
                                                return;
                                              if (result.success) {
                                                ScaffoldMessenger.of(
                                                  context,
                                                ).showSnackBar(
                                                  SnackBar(
                                                    content: Text(
                                                      result.message ??
                                                          'Usuario actualizado correctamente.',
                                                    ),
                                                  ),
                                                );
                                              } else if (result.message !=
                                                  null) {
                                                ScaffoldMessenger.of(
                                                  context,
                                                ).showSnackBar(
                                                  SnackBar(
                                                    content: Text(
                                                      result.message!,
                                                    ),
                                                  ),
                                                );
                                              }
                                            },
                                      style: ElevatedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 16,
                                        ),
                                        backgroundColor: cs.primary,
                                        foregroundColor: cs.onPrimary,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                        ),
                                        elevation: 2,
                                      ),
                                      child: controller.isSaving.value
                                          ? SizedBox(
                                              width: 20,
                                              height: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor:
                                                    AlwaysStoppedAnimation<
                                                      Color
                                                    >(
                                                      cs.onPrimary.withValues(
                                                        alpha: 0.7,
                                                      ),
                                                    ),
                                              ),
                                            )
                                          : Text(
                                              'Guardar cambios',
                                              style: tt.titleSmall?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                    ),
                                  ),
                                ),

                              // Read-only message
                              if (!controller.canUpdate)
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: cs.surfaceContainerHighest
                                        .withValues(alpha: 0.5),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.lock_outline,
                                        size: 20,
                                        color: cs.onSurfaceVariant,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          'Solo puedes visualizar la información de este usuario.',
                                          style: tt.bodyMedium?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),

                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ],
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
