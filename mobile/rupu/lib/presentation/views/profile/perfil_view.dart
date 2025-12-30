// views/perfil_view.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/design_helper.dart';

import 'package:rupu/presentation/widgets/image_preview_dialog.dart';
import 'perfil_controller.dart';

class PerfilView extends GetView<PerfilController> {
  final int pageIndex;
  const PerfilView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return GetBuilder<PerfilController>(
      builder: (ctrl) {
        return Scaffold(
          backgroundColor: Colors.transparent,
          body: Stack(
            children: [
              // Background Image with Blur
              if (ctrl.businessLogoUrl.isNotEmpty)
                Positioned.fill(
                  child: Image.network(
                    ctrl.businessLogoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              if (ctrl.businessLogoUrl.isNotEmpty)
                Positioned.fill(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: Container(color: cs.surface.withValues(alpha: 0.45)),
                  ),
                ),

              SafeArea(
                bottom: false, // Allow content to extend behind bottom nav
                child: ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 24,
                  ),
                  children: [
                    // Header: Avatar + Info
                    Center(
                      child: Column(
                        children: [
                          Stack(
                            alignment: Alignment.bottomRight,
                            children: [
                              GestureDetector(
                                onTap: ctrl.avatarUrl.isEmpty
                                    ? null
                                    : () => showImagePreviewDialog(
                                        context,
                                        imageUrl: ctrl.avatarUrl,
                                        title: ctrl.userName,
                                        heroTag: 'profile_avatar',
                                      ),
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: cs.outlineVariant.withValues(
                                        alpha: 0.5,
                                      ),
                                      width: 1,
                                    ),
                                  ),
                                  child: Hero(
                                    tag: 'profile_avatar',
                                    child: CircleAvatar(
                                      radius: 50,
                                      backgroundColor:
                                          cs.surfaceContainerHighest,
                                      backgroundImage:
                                          (ctrl.avatarUrl.isNotEmpty)
                                          ? NetworkImage(ctrl.avatarUrl)
                                          : null,
                                      child: ctrl.avatarUrl.isEmpty
                                          ? Icon(
                                              Icons.person,
                                              size: 48,
                                              color: cs.onSurfaceVariant,
                                            )
                                          : null,
                                    ),
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => ctrl.updateUserData(context),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: cs.primary,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: cs.surface,
                                      width: 2,
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.edit,
                                    size: 16,
                                    color: cs.onPrimary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            ctrl.userName,
                            textAlign: TextAlign.center,
                            style: tt.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            ctrl.email,
                            textAlign: TextAlign.center,
                            style: tt.bodyMedium?.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Business Card
                    const SectionTitle('Mi Negocio'),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () => ctrl.goToBusinessSelector(context),
                      borderRadius: BorderRadius.circular(16),
                      child: _BusinessCard(controller: ctrl),
                    ),

                    const SizedBox(height: 32),

                    // Settings
                    const SectionTitle('Configuración'),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: cs.surfaceContainerHighest.withValues(
                          alpha: 0.3,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: cs.outlineVariant.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Column(
                        children: [
                          Obx(
                            () => _SettingsTile(
                              icon: ctrl.isDarkRx.value
                                  ? Icons.light_mode_outlined
                                  : Icons.dark_mode_outlined,
                              title: 'Modo Oscuro',
                              trailing: Switch.adaptive(
                                value: ctrl.isDarkRx.value,
                                onChanged: (_) => ctrl.toggleTheme(),
                                activeThumbColor: cs.primary,
                              ),
                            ),
                          ),
                          Divider(
                            height: 1,
                            indent: 56,
                            endIndent: 16,
                            color: cs.outlineVariant.withValues(alpha: 0.3),
                          ),
                          _SettingsTile(
                            icon: Icons.lock_outline,
                            title: 'Cambiar contraseña',
                            onTap: () => ctrl.goToChangePassword(context),
                            trailing: Icon(
                              Icons.chevron_right,
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                          Divider(
                            height: 1,
                            indent: 56,
                            endIndent: 16,
                            color: cs.outlineVariant.withValues(alpha: 0.3),
                          ),
                          _SettingsTile(
                            icon: Icons.logout,
                            title: 'Cerrar sesión',
                            titleColor: cs.error,
                            iconColor: cs.error,
                            onTap: () => ctrl.confirmLogout(context),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? titleColor;
  final Color? iconColor;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.trailing,
    this.onTap,
    this.titleColor,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: iconColor ?? cs.onSurfaceVariant, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: tt.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: titleColor ?? cs.onSurface,
                ),
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}

class _BusinessCard extends StatelessWidget {
  const _BusinessCard({required this.controller});
  final PerfilController controller;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: cs.outlineVariant.withValues(alpha: 0.3),
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: controller.businessLogoUrl.isNotEmpty
                  ? Image.network(
                      controller.businessLogoUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          Icon(Icons.business, color: cs.onSurfaceVariant),
                    )
                  : Icon(Icons.business, color: cs.onSurfaceVariant),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.businessName.isNotEmpty
                      ? controller.businessName
                      : 'Negocio no asignado',
                  style: tt.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                if (controller.businessAddress.isNotEmpty)
                  Row(
                    children: [
                      Icon(
                        Icons.place_outlined,
                        size: 14,
                        color: cs.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          controller.businessAddress,
                          style: tt.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  )
                else
                  Text(
                    'Sin dirección registrada',
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
