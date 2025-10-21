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
      body: ListView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
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

          const SizedBox(height: 16),

          // ───────── Sección: Apariencia ─────────
          SectionCard(
            title: 'Apariencia',
            children: [
              Obx(() {
                final isDark = controller.isDarkRx.value;
                return SettingTile(
                  leadingIcon: isDark ? Icons.nights_stay : Icons.wb_sunny,
                  title: isDark ? 'Modo oscuro' : 'Modo claro',
                  subtitle: 'Cambia el tema de la aplicación',
                  trailing: Switch.adaptive(
                    value: isDark,
                    activeTrackColor: cs.primary,
                    onChanged: (_) => controller.toggleTheme(),
                  ),
                  onTap: controller.toggleTheme,
                );
              }),
            ],
          ),

          const SizedBox(height: 12),

          if (controller.isAdmin)
            SectionCard(
              title: 'Administración',
              children: [
                SettingTile(
                  leadingIcon: Icons.person_add,
                  title: 'Crear usuario',
                  subtitle: 'Invita a tu equipo y gestiona accesos',
                  onTap: () => controller.goToCreateUser(context, pageIndex),
                ),
              ],
            ),

          const SizedBox(height: 12),

          SectionCard(
            title: 'Información',
            children: [
              SettingTile(
                leadingIcon: Icons.info_outline,
                title: 'Acerca de',
                subtitle: 'Versión de la app y licencias',
                onTap: () => showAboutDialog(
                  context: context,
                  applicationName: 'Rupü',
                  applicationVersion: '1.0.0',
                  applicationIcon: Icon(
                    Icons.local_activity,
                    color: cs.primary,
                  ),
                  children: const [
                    SizedBox(height: 8),
                    Text('Aplicación de gestión.'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
