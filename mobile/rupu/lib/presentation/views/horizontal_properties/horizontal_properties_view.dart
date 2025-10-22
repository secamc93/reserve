// presentation/views/horizontal_properties/horizontal_properties_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/domain/entities/horizontal_property_update_result.dart';
import 'horizontal_properties_controller.dart';
import 'horizontal_property_update_view.dart';

class HorizontalPropertiesView extends GetView<HorizontalPropertiesController> {
  static const name = 'horizontal-properties';
  final int pageIndex;

  const HorizontalPropertiesView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    // final tt = theme.textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Propiedades horizontales'),
        centerTitle: true,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreatePropertyDialog(context),
        icon: const Icon(Icons.add_home_work_outlined),
        label: const Text('Agregar propiedad'),
      ),
      body: SafeArea(
        child: Obx(() {
          final loading =
              controller.isLoading.value && controller.properties.isEmpty;
          final error = controller.errorMessage.value;

          if (loading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: controller.fetchProperties,
            child: LayoutBuilder(
              builder: (context, c) {
                final width = c.maxWidth;
                final cross = width >= 1200
                    ? 4
                    : width >= 900
                    ? 3
                    : width >= 600
                    ? 2
                    : 1;

                return CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(24, 10, 24, 55),
                      sliver: SliverToBoxAdapter(
                        child: _Header(
                          onCreate: () => _showCreatePropertyDialog(context),
                          total: controller.total.value,
                          trailingProgress: controller.isLoading.value,
                        ),
                      ),
                    ),

                    if (error != null) ...[
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        sliver: SliverToBoxAdapter(
                          child: _InlineError(
                            message: error,
                            onRetry: controller.fetchProperties,
                          ),
                        ),
                      ),
                    ],

                    if (controller.properties.isEmpty && error == null) ...[
                      SliverFillRemaining(
                        hasScrollBody: false,
                        child: _EmptyState(
                          icon: Icons.apartment_outlined,
                          title: 'No se encontraron propiedades horizontales.',
                          subtitle:
                              'Crea una nueva o actualiza para intentarlo de nuevo.',
                        ),
                      ),
                    ] else ...[
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(24, 8, 24, 55),
                        sliver: SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: cross,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                                childAspectRatio: 0.92,
                              ),
                          delegate: SliverChildBuilderDelegate((context, i) {
                            final p = controller.properties[i];
                            return _PropertyCard(
                              id: p.id,
                              name: p.name,
                              address: (p.address?.isNotEmpty ?? false)
                                  ? p.address!
                                  : 'Sin dirección',
                              units: p.totalUnits ?? 0,
                              isActive: p.isActive,
                              createdAt: controller.formatDate(p.createdAt),
                              // Preparado para imagen: usa p.coverUrl / p.logoUrl si existe
                              imageUrl: null,
                              onView: () {
                                final path =
                                    '/home/$pageIndex/horizontal-properties/${p.id}';
                                context.push(path);
                              },
                              onEdit: () async {
                                final result =
                                    await showModalBottomSheet<
                                      HorizontalPropertyUpdateResult?
                                    >(
                                      context: context,
                                      isScrollControlled: true,
                                      builder: (_) =>
                                          HorizontalPropertyUpdateSheet(
                                            propertyId: p.id,
                                          ),
                                    );
                                if (!context.mounted || result == null) return;
                                final msg =
                                    result.message ??
                                    (result.success
                                        ? 'Propiedad horizontal actualizada correctamente.'
                                        : 'No se pudo actualizar la propiedad.');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(msg),
                                    backgroundColor: result.success
                                        ? null
                                        : cs.error,
                                  ),
                                );
                                if (result.success)
                                  controller.fetchProperties();
                              },
                              onDelete: () async {
                                if (controller.isDeleting(p.id)) return;
                                final ok = await showDialog<bool>(
                                  context: context,
                                  builder: (dctx) => AlertDialog(
                                    title: const Text('Confirmar eliminación'),
                                    content: Text(
                                      '¿Eliminar "${p.name}"? Esta acción no se puede deshacer.',
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.of(dctx).pop(false),
                                        child: const Text('Cancelar'),
                                      ),
                                      FilledButton(
                                        onPressed: () =>
                                            Navigator.of(dctx).pop(true),
                                        child: const Text('Eliminar'),
                                      ),
                                    ],
                                  ),
                                );
                                if (ok != true) return;
                                final res = await controller.deleteProperty(
                                  id: p.id,
                                );
                                if (!context.mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      res.message ??
                                          (res.success
                                              ? 'Propiedad horizontal eliminada exitosamente.'
                                              : 'No se pudo eliminar la propiedad horizontal.'),
                                    ),
                                    backgroundColor: res.success
                                        ? null
                                        : cs.error,
                                  ),
                                );
                                if (res.success) controller.fetchProperties();
                              },
                              isDeleting: controller.isDeleting(p.id),
                            );
                          }, childCount: controller.properties.length),
                        ),
                      ),
                    ],
                  ],
                );
              },
            ),
          );
        }),
      ),
    );
  }

  Future<void> _showCreatePropertyDialog(BuildContext context) async {
    controller.resetCreateForm();
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        final dialogTheme = Theme.of(dialogCtx);
        return Obx(() {
          final isCreating = controller.isCreating.value;
          return AlertDialog(
            title: const Text('Crear nueva propiedad horizontal'),
            content: Form(
              key: controller.createFormKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Información básica',
                      style: dialogTheme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: controller.createNameCtrl,
                      textCapitalization: TextCapitalization.words,
                      decoration: const InputDecoration(
                        labelText: 'Nombre *',
                        hintText: 'Ingresa el nombre de la propiedad',
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'El nombre es obligatorio'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: controller.createAddressCtrl,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        labelText: 'Dirección *',
                        hintText: 'Ingresa la dirección de la propiedad',
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'La dirección es obligatoria'
                          : null,
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: isCreating
                    ? null
                    : () {
                        controller.resetCreateForm();
                        Navigator.of(dialogCtx).pop();
                      },
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: isCreating
                    ? null
                    : () async {
                        FocusScope.of(dialogCtx).unfocus();
                        final result = await controller.createProperty();
                        final messenger = ScaffoldMessenger.of(context);
                        if (result.success) {
                          Navigator.of(dialogCtx).pop();
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(
                                result.message ??
                                    'Propiedad horizontal creada exitosamente.',
                              ),
                            ),
                          );
                          controller.fetchProperties();
                        } else {
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(
                                result.message?.isNotEmpty == true
                                    ? result.message!
                                    : 'No se pudo crear la propiedad horizontal.',
                              ),
                              backgroundColor: Theme.of(
                                context,
                              ).colorScheme.error,
                            ),
                          );
                        }
                      },
                child: isCreating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Crear propiedad'),
              ),
            ],
          );
        });
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.onCreate,
    required this.total,
    required this.trailingProgress,
  });

  final VoidCallback onCreate;
  final int total;
  final bool trailingProgress;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gestión de propiedades Horizontales',
          style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        Text(
          'Propiedades horizontales: $total',
          style: tt.titleMedium?.copyWith(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w600,
          ),
        ),
        // Row(
        //   children: [
        //     FilledButton.icon(
        //       onPressed: onCreate,
        //       icon: const Icon(Icons.add_home_work_outlined),
        //       label: const Text('Agregar Propiedad'),
        //     ),
        //     if (trailingProgress) ...[
        //       const SizedBox(width: 14),
        //       const SizedBox(
        //         width: 22,
        //         height: 22,
        //         child: CircularProgressIndicator(strokeWidth: 2),
        //       ),
        //     ],
        //   ],
        // ),
      ],
    );
  }
}

class _PropertyCard extends StatelessWidget {
  const _PropertyCard({
    required this.id,
    required this.name,
    required this.address,
    required this.units,
    required this.isActive,
    required this.createdAt,
    required this.onView,
    required this.onEdit,
    required this.onDelete,
    required this.isDeleting,
    this.imageUrl,
  });

  final int id;
  final String name;
  final String address;
  final int units;
  final bool isActive;
  final String createdAt; // texto ya formateado
  final String? imageUrl;
  final VoidCallback onView;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final bool isDeleting;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final (bgChip, fgChip, labelChip) = isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVO')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVO');

    return DecoratedBox(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .06),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: LayoutBuilder(
          builder: (ctx, constraints) {
            // Altura de media adaptable y acotada para evitar overflow:
            final w = constraints.maxWidth;
            final desired = w * 9 / 16; // proporción 16:9
            final mediaH = desired.clamp(120.0, 180.0); // límites seguros

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // --- Cabecera visual (limpia, sin badges) ---
                SizedBox(
                  height: mediaH,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (imageUrl == null || imageUrl!.isEmpty)
                        // Placeholder premium preparado para NetworkImage
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [cs.surfaceContainerHighest, cs.surface],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                        )
                      else
                        Image.network(
                          imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: cs.surfaceContainerHighest),
                        ),
                      // Degradado inferior para legibilidad si más adelante pones texto sobre imagen
                      Positioned.fill(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.center,
                              colors: [
                                Colors.black.withValues(alpha: .22),
                                Colors.transparent,
                              ],
                            ),
                          ),
                        ),
                      ),
                      // Menú / acceso rápido
                      Positioned(
                        right: 4,
                        top: 4,
                        child: IconButton.filledTonal(
                          onPressed: onView,
                          icon: const Icon(Icons.more_horiz),
                          tooltip: 'Abrir',
                        ),
                      ),
                    ],
                  ),
                ),

                // --- Cuerpo ---
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Estado + Creada el … (en la misma línea; usa Wrap por si no alcanza)
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: ShapeDecoration(
                              color: bgChip,
                              shape: StadiumBorder(
                                side: BorderSide(
                                  color: fgChip.withValues(alpha: .20),
                                ),
                              ),
                            ),
                            child: Text(
                              labelChip,
                              style: tt.labelSmall?.copyWith(
                                color: fgChip,
                                fontWeight: FontWeight.w900,
                                letterSpacing: .2,
                              ),
                            ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.event_outlined,
                                size: 16,
                                color: cs.onSurfaceVariant,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Creada $createdAt',
                                style: tt.labelMedium?.copyWith(
                                  color: cs.onSurfaceVariant,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Título
                      Text(
                        name,
                        style: tt.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 10),

                      // Info
                      _InfoLine(icon: Icons.place_outlined, text: address),
                      const SizedBox(height: 4),
                      _InfoLine(
                        icon: Icons.view_module_outlined,
                        text: 'Unidades: $units',
                      ),

                      const SizedBox(height: 12),

                      // Acciones
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: onView,
                              icon: const Icon(Icons.visibility_outlined),
                              label: const Text('Ver'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: FilledButton.tonalIcon(
                              onPressed: onEdit,
                              icon: const Icon(Icons.edit_outlined),
                              label: const Text('Editar'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: FilledButton(
                              onPressed: isDeleting ? null : onDelete,
                              child: isDeleting
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Text('Eliminar'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  const _InfoLine({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: tt.bodyMedium?.copyWith(
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message, required this.onRetry});
  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.errorContainer,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.error.withValues(alpha: .25)),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: cs.onErrorContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: tt.bodyMedium?.copyWith(color: cs.onErrorContainer),
            ),
          ),
          TextButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });
  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: cs.onSurfaceVariant),
            const SizedBox(height: 12),
            Text(
              title,
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
