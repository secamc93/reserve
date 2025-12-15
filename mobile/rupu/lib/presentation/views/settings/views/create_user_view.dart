// presentation/views/settings/create_user_view.dart
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/domain/entities/create_user_result.dart';
import 'package:rupu/presentation/widgets/shared/rupu_loader.dart';
import '../controllers/create_user_controller.dart';

class CreateUserView extends GetView<CreateUserController> {
  static const name = 'create-user';
  const CreateUserView({super.key});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: cs.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: cs.onPrimary),
          onPressed: () => GoRouter.of(context).pop(),
        ),
      ),
      body: Stack(
        children: [
          // Gradient header background
          Container(
            height: 180,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [cs.primary, cs.secondary.withValues(alpha: 0.9)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // Main content
          Form(
            key: controller.formKey,
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: MediaQuery.of(context).padding.top + 60,
                  ),
                ),

                // Profile picture section
                SliverToBoxAdapter(
                  child: Center(
                    child: Obx(() {
                      final processing = controller.avatarProcessing.value;
                      final file = controller.avatarFile.value;
                      final hasUrl = controller.hasAvatarUrl.value;
                      final url = controller.avatarUrlCtrl.text;

                      return Column(
                        children: [
                          Stack(
                            children: [
                              // Profile picture container
                              GestureDetector(
                                onTap: (processing || hasUrl)
                                    ? null
                                    : () => _showAvatarSourceSheet(
                                        context,
                                        controller,
                                      ),
                                child: Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: cs.surfaceContainerHighest,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 4,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(
                                          alpha: 0.15,
                                        ),
                                        blurRadius: 20,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: processing
                                      ? const Center(
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : (hasUrl && url.isNotEmpty)
                                      ? ClipOval(
                                          child: Image.network(
                                            url,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Icon(
                                              Icons.person_outline,
                                              size: 50,
                                              color: cs.onSurfaceVariant,
                                            ),
                                          ),
                                        )
                                      : file != null
                                      ? ClipOval(
                                          child: Image.file(
                                            File(file.path),
                                            fit: BoxFit.cover,
                                            width: 120,
                                            height: 120,
                                            errorBuilder: (_, __, ___) => Icon(
                                              Icons.check_circle,
                                              size: 50,
                                              color: cs.primary,
                                            ),
                                          ),
                                        )
                                      : Icon(
                                          Icons.person_add_alt_1_outlined,
                                          size: 50,
                                          color: cs.onSurfaceVariant,
                                        ),
                                ),
                              ),

                              // Camera button overlay
                              if (!processing && !hasUrl)
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: GestureDetector(
                                    onTap: () => _showAvatarSourceSheet(
                                      context,
                                      controller,
                                    ),
                                    child: Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: LinearGradient(
                                          colors: [cs.primary, cs.secondary],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: cs.primary.withValues(
                                              alpha: 0.3,
                                            ),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.camera_alt_rounded,
                                        size: 18,
                                        color: cs.onPrimary,
                                      ),
                                    ),
                                  ),
                                ),

                              // Remove button
                              if (file != null && !processing)
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: GestureDetector(
                                    onTap: controller.removeAvatarFile,
                                    child: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: Colors.red,
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.red.withValues(
                                              alpha: 0.3,
                                            ),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.close_rounded,
                                        size: 18,
                                        color: cs.onErrorContainer,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),

                          const SizedBox(height: 2),

                          // Avatar status text
                          Text(
                            processing
                                ? 'Procesando imagen...'
                                : file != null
                                ? file.fileName
                                : hasUrl
                                ? 'Foto de URL'
                                : 'Agregar foto de perfil',
                            style: tt.bodyMedium?.copyWith(
                              color: cs.onPrimaryContainer,
                              fontWeight: FontWeight.w600,
                            ),
                          ),

                          if (file != null && !processing)
                            Text(
                              controller.formatFileSize(file.sizeInBytes),
                              style: tt.bodySmall?.copyWith(
                                color: cs.onPrimary.withValues(alpha: 0.8),
                              ),
                            ),
                        ],
                      );
                    }),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 16)),

                // Form fields container
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cs.surface,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Información personal',
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Name field
                        TextFormField(
                          controller: controller.nameCtrl,
                          decoration: InputDecoration(
                            labelText: 'Nombre completo',
                            hintText: 'Juan Pérez',
                            prefixIcon: Icon(
                              Icons.person_outline,
                              color: cs.primary,
                            ),
                            filled: true,
                            fillColor: cs.surfaceContainerHighest.withValues(
                              alpha: 0.4,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: cs.primary,
                                width: 2,
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: cs.error, width: 2),
                            ),
                          ),
                          validator: (v) => (v == null || v.isEmpty)
                              ? 'El nombre es requerido'
                              : null,
                        ),

                        const SizedBox(height: 12),

                        // Email field
                        TextFormField(
                          controller: controller.emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            labelText: 'Correo electrónico',
                            hintText: 'juan@ejemplo.com',
                            prefixIcon: Icon(
                              Icons.email_outlined,
                              color: cs.primary,
                            ),
                            filled: true,
                            fillColor: cs.surfaceContainerHighest.withValues(
                              alpha: 0.4,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: cs.primary,
                                width: 2,
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: cs.error, width: 2),
                            ),
                          ),
                          validator: (v) => (v == null || v.isEmpty)
                              ? 'El email es requerido'
                              : null,
                        ),

                        const SizedBox(height: 12),

                        // Phone field
                        TextFormField(
                          controller: controller.phoneCtrl,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: 'Teléfono',
                            hintText: '+57 300 123 4567',
                            prefixIcon: Icon(
                              Icons.phone_outlined,
                              color: cs.primary,
                            ),
                            filled: true,
                            fillColor: cs.surfaceContainerHighest.withValues(
                              alpha: 0.4,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: cs.primary,
                                width: 2,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Avatar URL field
                        TextFormField(
                          controller: controller.avatarUrlCtrl,
                          decoration: InputDecoration(
                            labelText: 'URL de foto (opcional)',
                            hintText: 'https://ejemplo.com/foto.jpg',
                            prefixIcon: Icon(
                              Icons.link_outlined,
                              color: cs.primary,
                            ),
                            filled: true,
                            fillColor: cs.surfaceContainerHighest.withValues(
                              alpha: 0.4,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: cs.primary,
                                width: 2,
                              ),
                            ),
                          ),
                          onChanged: controller.onAvatarUrlChanged,
                        ),

                        // Avatar error message
                        Obx(
                          () => controller.avatarError.value != null
                              ? Padding(
                                  padding: const EdgeInsets.only(
                                    top: 8,
                                    left: 4,
                                  ),
                                  child: Text(
                                    controller.avatarError.value!,
                                    style: tt.bodySmall?.copyWith(
                                      color: cs.error,
                                    ),
                                  ),
                                )
                              : const SizedBox.shrink(),
                        ),

                        const SizedBox(height: 20),

                        // Active status toggle
                        Obx(
                          () => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: cs.surfaceContainerHighest.withValues(
                                alpha: 0.4,
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.verified_user_outlined,
                                      color: controller.isActive.value
                                          ? cs.primary
                                          : cs.onSurfaceVariant,
                                      size: 22,
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Estado del usuario',
                                          style: tt.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          controller.isActive.value
                                              ? 'Activo'
                                              : 'Inactivo',
                                          style: tt.bodySmall?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Switch(
                                  value: controller.isActive.value,
                                  onChanged: (v) =>
                                      controller.isActive.value = v,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 16)),

                // Business selector section
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cs.surface,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Negocios asignados',
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 12),

                        Obx(
                          () => GestureDetector(
                            onTap: () =>
                                _openBusinessPicker(context, controller),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: cs.surfaceContainerHighest.withValues(
                                  alpha: 0.4,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: cs.outlineVariant.withValues(
                                    alpha: 0.5,
                                  ),
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: cs.primaryContainer,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(
                                      Icons.store_mall_directory_outlined,
                                      color: cs.primary,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Seleccionar negocios',
                                          style: tt.bodyLarge?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          '${controller.selectedBusinesses.length} seleccionados',
                                          style: tt.bodySmall?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    Icons.chevron_right_rounded,
                                    color: cs.onSurfaceVariant,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Selected businesses chips
                        Obx(() {
                          final businesses = controller.selectedBusinesses;
                          if (businesses.isEmpty) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Text(
                                'No hay negocios asignados',
                                style: tt.bodySmall?.copyWith(
                                  color: cs.onSurfaceVariant,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            );
                          }
                          return Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: businesses
                                .map(
                                  (business) => Chip(
                                    avatar: CircleAvatar(
                                      backgroundColor: cs.primaryContainer,
                                      child: Icon(
                                        Icons.storefront_outlined,
                                        size: 16,
                                        color: cs.primary,
                                      ),
                                    ),
                                    label: Text(business.name),
                                    deleteIcon: Icon(
                                      Icons.close_rounded,
                                      size: 18,
                                      color: cs.onSurfaceVariant,
                                    ),
                                    onDeleted: () =>
                                        controller.removeBusiness(business.id),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                  ),
                                )
                                .toList(),
                          );
                        }),
                      ],
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 24)),

                // Error message
                SliverToBoxAdapter(
                  child: Obx(
                    () => controller.errorMessage.value != null
                        ? Container(
                            margin: const EdgeInsets.symmetric(horizontal: 16),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: cs.errorContainer,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.error_outline, color: cs.error),
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
                          )
                        : const SizedBox.shrink(),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 24)),

                // Save button
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Obx(
                      () => Container(
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: controller.isSubmitting.value
                                ? [
                                    cs.surfaceContainerHighest,
                                    cs.surfaceContainerHighest,
                                  ]
                                : [cs.primary, cs.secondary],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(28),
                          boxShadow: controller.isSubmitting.value
                              ? []
                              : [
                                  BoxShadow(
                                    color: cs.primary.withValues(alpha: 0.3),
                                    blurRadius: 16,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                        ),
                        child: ElevatedButton(
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
                                    final message =
                                        controller.errorMessage.value;
                                    if (message != null) {
                                      await _showErrorDialog(context, message);
                                    }
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            foregroundColor: cs.onPrimary,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(28),
                            ),
                          ),
                          child: controller.isSubmitting.value
                              ? SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      cs.onPrimary.withValues(alpha: 0.7),
                                    ),
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.check_circle_outline_rounded,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Crear usuario',
                                      style: tt.titleSmall?.copyWith(
                                        color: cs.onPrimary,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 32)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> _showSuccessDialog(
  BuildContext context,
  CreateUserResult result,
) async {
  final cs = Theme.of(context).colorScheme;
  final tt = Theme.of(context).textTheme;

  await showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (dialogCtx) {
      return Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: BorderRadius.circular(28),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [cs.primary, cs.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: cs.primary.withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.check_circle_outline_rounded,
                  size: 40,
                  color: cs.onPrimary,
                ),
              ),

              const SizedBox(height: 20),

              Text(
                '¡Usuario creado!',
                style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              Text(
                result.message ?? 'El usuario se creó correctamente.',
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 20),

              // User info container
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.email_outlined, size: 18, color: cs.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: SelectableText(
                            result.email,
                            style: tt.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),

                    if (result.password != null &&
                        result.password!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(Icons.lock_outline, size: 18, color: cs.primary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Contraseña temporal',
                                  style: tt.bodySmall?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                SelectableText(
                                  result.password!,
                                  style: tt.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action buttons
              Row(
                children: [
                  if (result.password != null && result.password!.isNotEmpty)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          await Clipboard.setData(
                            ClipboardData(text: result.password!),
                          );
                          if (dialogCtx.mounted) {
                            ScaffoldMessenger.of(dialogCtx).showSnackBar(
                              SnackBar(
                                content: const Text('Contraseña copiada'),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            );
                          }
                        },
                        icon: const Icon(Icons.copy_all_outlined),
                        label: const Text('Copiar'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ),

                  if (result.password != null && result.password!.isNotEmpty)
                    const SizedBox(width: 12),

                  Expanded(
                    flex: result.password != null && result.password!.isNotEmpty
                        ? 1
                        : 2,
                    child: FilledButton(
                      onPressed: () => Navigator.of(dialogCtx).pop(),
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        backgroundColor: cs.primary,
                        foregroundColor: cs.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text('Continuar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
}

Future<void> _showErrorDialog(BuildContext context, String message) async {
  final cs = Theme.of(context).colorScheme;
  final tt = Theme.of(context).textTheme;

  await showDialog<void>(
    context: context,
    builder: (dialogCtx) {
      return Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: BorderRadius.circular(28),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Error icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: cs.errorContainer,
                  boxShadow: [
                    BoxShadow(
                      color: cs.error.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.error_outline_rounded,
                  size: 40,
                  color: cs.error,
                ),
              ),

              const SizedBox(height: 20),

              Text(
                'Error al crear usuario',
                style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              Text(
                message,
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(dialogCtx).pop(),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: cs.primary,
                    foregroundColor: cs.onPrimary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text('Entendido'),
                ),
              ),
            ],
          ),
        ),
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
    backgroundColor: cs.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
    ),
    builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        cs.primary.withValues(alpha: 0.15),
                        cs.secondary.withValues(alpha: 0.12),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    Icons.add_photo_alternate_outlined,
                    color: cs.primary,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 14),
                Text(
                  'Foto de perfil',
                  style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Camera option
            Material(
              color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                onTap: () async {
                  Navigator.of(ctx).pop();
                  await controller.pickAvatarFromCamera();
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: cs.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.photo_camera_outlined,
                          color: cs.primary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tomar foto',
                              style: tt.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Usa la cámara para capturar la foto',
                              style: tt.bodySmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: cs.onSurfaceVariant,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Gallery option
            Material(
              color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                onTap: () async {
                  Navigator.of(ctx).pop();
                  await controller.pickAvatar();
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: cs.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.photo_library_outlined,
                          color: cs.primary,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Desde galería',
                              style: tt.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Selecciona una foto de tu galería',
                              style: tt.bodySmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: cs.onSurfaceVariant,
                      ),
                    ],
                  ),
                ),
              ),
            ),
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
  final cs = Theme.of(context).colorScheme;
  final tt = Theme.of(context).textTheme;

  await controller.searchBusinesses('');
  final searchCtrl = TextEditingController();

  await showDialog<void>(
    context: context,
    builder: (dialogCtx) {
      return Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        child: Container(
          width: 480,
          constraints: const BoxConstraints(maxHeight: 600),
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: BorderRadius.circular(28),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            cs.primary.withValues(alpha: 0.15),
                            cs.secondary.withValues(alpha: 0.12),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        Icons.store_mall_directory_outlined,
                        color: cs.primary,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Seleccionar negocios',
                        style: tt.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.of(dialogCtx).pop(),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1),

              // Search field
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: TextField(
                  controller: searchCtrl,
                  textInputAction: TextInputAction.search,
                  decoration: InputDecoration(
                    hintText: 'Buscar por nombre o tipo',
                    prefixIcon: Icon(Icons.search, color: cs.primary),
                    filled: true,
                    fillColor: cs.surfaceContainerHighest.withValues(
                      alpha: 0.5,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(color: cs.primary, width: 2),
                    ),
                    suffixIcon: searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              searchCtrl.clear();
                              controller.searchBusinesses('');
                            },
                          )
                        : null,
                  ),
                  onSubmitted: (value) => controller.searchBusinesses(value),
                  onChanged: (value) {
                    // Trigger rebuild for suffix icon
                  },
                ),
              ),

              // Business list
              Flexible(
                child: Obx(() {
                  final isLoading = controller.businessSuggestionsLoading.value;
                  final error = controller.businessSuggestionsError.value;
                  final suggestions = controller.businessSuggestions;

                  if (isLoading) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: RupuLoader(),
                      ),
                    );
                  }

                  if (error != null) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 48,
                              color: cs.error,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              error,
                              textAlign: TextAlign.center,
                              style: tt.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 16),
                            FilledButton.tonal(
                              onPressed: () =>
                                  controller.searchBusinesses(searchCtrl.text),
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  if (suggestions.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 48,
                              color: cs.onSurfaceVariant,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No se encontraron negocios',
                              style: tt.bodyLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Intenta con otro término de búsqueda',
                              style: tt.bodySmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  final selectedIds = controller.selectedBusinesses
                      .map((biz) => biz.id)
                      .toSet();

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shrinkWrap: true,
                    itemCount: suggestions.length,
                    separatorBuilder: (_, __) =>
                        const Divider(height: 1, indent: 76),
                    itemBuilder: (_, index) {
                      final business = suggestions[index];
                      final isSelected = selectedIds.contains(business.id);

                      return Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: isSelected
                              ? null
                              : () =>
                                    controller.addBusinessFromCatalog(business),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            child: Row(
                              children: [
                                // Avatar
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? cs.secondaryContainer
                                        : cs.primaryContainer,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      business.name.isNotEmpty
                                          ? business.name
                                                .substring(0, 1)
                                                .toUpperCase()
                                          : '?',
                                      style: tt.titleMedium?.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: isSelected
                                            ? cs.onSecondaryContainer
                                            : cs.onPrimaryContainer,
                                      ),
                                    ),
                                  ),
                                ),

                                const SizedBox(width: 14),

                                // Business info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        business.name,
                                        style: tt.bodyLarge?.copyWith(
                                          fontWeight: FontWeight.w600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        business.businessType.isEmpty
                                            ? 'Sin tipo registrado'
                                            : business.businessType,
                                        style: tt.bodySmall?.copyWith(
                                          color: cs.onSurfaceVariant,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(width: 12),

                                // Status icon
                                Icon(
                                  isSelected
                                      ? Icons.check_circle
                                      : Icons.add_circle_outline,
                                  color: isSelected ? cs.secondary : cs.primary,
                                  size: 28,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                }),
              ),

              const Divider(height: 1),

              // Close button
              Padding(
                padding: const EdgeInsets.all(20),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(dialogCtx).pop(),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: cs.primary,
                      foregroundColor: cs.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text('Listo'),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
  searchCtrl.dispose();
}
