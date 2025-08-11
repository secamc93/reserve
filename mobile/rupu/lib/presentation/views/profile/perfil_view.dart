// views/perfil_view.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/presentation/widgets/widgets.dart';
import 'perfil_controller.dart';

class PerfilView extends GetView<PerfilController> {
  final int pageIndex;
  const PerfilView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return SafeArea(
      child: Stack(
        children: [
          // Fondo con logo del negocio
          Positioned.fill(
            child: Image.network(
              controller.businessLogoUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(color: cs.surfaceContainerHighest),
            ),
          ),
          // Overlay global (sutil)
          Positioned.fill(
            child: Container(color: cs.surface.withValues(alpha: .15)),
          ),
          // Contenido
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _ThemeTogglePill(controller: controller),

              const SizedBox(height: 8),

              // Tarjeta principal con efecto glass
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cs.surface.withValues(alpha: .22),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: cs.outlineVariant.withValues(alpha: .35),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 56,
                          backgroundImage: (controller.avatarUrl.isNotEmpty)
                              ? NetworkImage(controller.avatarUrl)
                              : null,
                          child: controller.avatarUrl.isEmpty
                              ? const Icon(Icons.person, size: 48)
                              : null,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          controller.userName,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.headlineSmall!
                              .copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          controller.email,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyMedium!
                              .copyWith(
                                color: cs.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 16),
                        _BusinessCard(controller: controller),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: CustomTextButton(
                                onPressed: () =>
                                    controller.goToChangePassword(context),
                                textButton: 'Cambiar contraseña',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: CustomTextButton(
                                onPressed: () => controller.logout(context),
                                textButton: 'Cerrar sesión',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ],
      ),
    );
  }
}

// ───────────────────────── Pill con blur para el switch ─────────────────────────
class _ThemeTogglePill extends StatelessWidget {
  const _ThemeTogglePill({required this.controller});
  final PerfilController controller;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            // Fondo semitransparente + gradiente MUY sutil para contraste
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                cs.surface.withValues(alpha: .55),
                cs.surface.withValues(alpha: .35),
              ],
            ),
            border: Border.all(color: cs.outlineVariant.withValues(alpha: .35)),
          ),
          child: Obx(() {
            final isDark = controller.isDarkRx.value;
            // Forzamos color de texto/icono para legibilidad
            final textColor = Theme.of(context).brightness == Brightness.dark
                ? cs.onSurface
                : cs.onSurface;

            return SwitchListTile.adaptive(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              title: Text(
                isDark ? 'Modo Oscuro' : 'Modo Claro',
                style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
              ),
              value: isDark,
              onChanged: (_) => controller.toggleTheme(),
              secondary: Icon(
                isDark ? Icons.nights_stay : Icons.wb_sunny,
                color: textColor,
              ),
              // Mejora de usabilidad en móviles
              visualDensity: VisualDensity.compact,
            );
          }),
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
    return PrimaryCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: SizedBox(
                width: 72,
                height: 72,
                child: Image.network(
                  controller.businessLogoUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      Container(color: cs.surfaceContainerHighest),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    controller.businessName,
                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    controller.businessDescription,
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall!.copyWith(color: cs.onSurfaceVariant),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.place_outlined,
                        size: 16,
                        color: cs.onSurfaceVariant,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          controller.businessAddress,
                          style: Theme.of(context).textTheme.bodySmall!
                              .copyWith(color: cs.onSurfaceVariant),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
