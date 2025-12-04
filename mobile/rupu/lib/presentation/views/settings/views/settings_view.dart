// presentation/views/settings/settings_view.dart
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/settings_controller.dart';
import '../widgets/widgets.dart';

class SettingsView extends GetView<SettingsController> {
  static const name = 'settings-screen';
  final int pageIndex;
  const SettingsView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes'), centerTitle: true),
      body: GetBuilder<SettingsController>(
        initState: (_) => controller.checkBiometricStatus(),
        builder: (_) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // ───────── Header premium ─────────
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      cs.primary.withValues(alpha: .12),
                      cs.secondary.withValues(alpha: .10),
                    ],
                  ),
                  border: Border.all(color: cs.outlineVariant),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: .05),
                      blurRadius: 18,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // ícono en “chip” de vidrio
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest.withValues(
                              alpha: .35,
                            ),
                            border: Border.all(color: cs.outlineVariant),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          alignment: Alignment.center,
                          child: Icon(Icons.tune, color: cs.primary, size: 26),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Personaliza tu experiencia',
                            style: tt.titleLarge!.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Tema, preferencias y más.',
                            style: tt.bodyMedium!.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const _SectionTitle('General'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: cs.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  children: [
                    Obx(
                      () => SettingTile(
                        leadingIcon: controller.isDarkRx.value
                            ? Icons.light_mode_outlined
                            : Icons.dark_mode_outlined,
                        title: 'Modo Oscuro',
                        subtitle: 'Cambiar apariencia de la app',
                        trailing: Switch.adaptive(
                          value: controller.isDarkRx.value,
                          onChanged: (_) => controller.toggleTheme(),
                          activeTrackColor: cs.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const _SectionTitle('Seguridad'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: cs.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  children: [
                    SettingTile(
                      leadingIcon: Icons.lock_outline,
                      title: 'Cambiar contraseña',
                      subtitle: 'Actualizar tu clave de acceso',
                      trailing: Icon(
                        Icons.chevron_right,
                        color: cs.onSurfaceVariant,
                      ),
                      onTap: () {
                        // TODO: Implementar cambio de contraseña
                      },
                    ),
                    Obx(() {
                      if (!controller.isBiometricAvailable.value ||
                          !controller.hasSavedCredentials.value) {
                        return const SizedBox.shrink();
                      }
                      return Column(
                        children: [
                          Divider(
                            height: 1,
                            indent: 56,
                            endIndent: 16,
                            color: cs.outlineVariant.withValues(alpha: 0.3),
                          ),
                          SettingTile(
                            leadingIcon: Icons.fingerprint,
                            title:
                                'Eliminar ${controller.biometricDescription.value}',
                            subtitle: 'Eliminar credenciales guardadas',
                            trailing: Icon(
                              Icons.delete_outline,
                              color: cs.error,
                            ),
                            onTap: () =>
                                controller.removeBiometricCredentials(context),
                          ),
                        ],
                      );
                    }),
                  ],
                ),
              ),

              if (controller.isAdmin) ...[
                const SizedBox(height: 24),
                const _SectionTitle('Administración'),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: cs.outlineVariant.withValues(alpha: 0.3),
                    ),
                  ),
                  child: SettingTile(
                    leadingIcon: Icons.person_add_outlined,
                    title: 'Crear Usuario',
                    subtitle: 'Registrar un nuevo usuario',
                    trailing: Icon(
                      Icons.chevron_right,
                      color: cs.onSurfaceVariant,
                    ),
                    onTap: () => controller.goToCreateUser(context, pageIndex),
                  ),
                ),
              ],

              const SizedBox(height: 24),
              const _SectionTitle('Información'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: cs.outlineVariant.withValues(alpha: 0.3),
                  ),
                ),
                child: SettingTile(
                  leadingIcon: Icons.info_outline,
                  title: 'Acerca de',
                  subtitle: 'Versión de la app y licencias',
                  trailing: Icon(
                    Icons.chevron_right,
                    color: cs.onSurfaceVariant,
                  ),
                  onTap: () => showAboutDialog(
                    context: context,
                    applicationName: 'Rupu Reserve',
                    applicationVersion: '1.0.0',
                    applicationIcon: const FlutterLogo(),
                    children: [
                      const Text(
                        'Gestión inteligente para propiedad horizontal.',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, bottom: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}
