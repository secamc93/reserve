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

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'RUPÜ Propiedades',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 22,
            color: cs.onSurface,
          ),
        ),
        // ✅ CAMBIO 1: Se eliminaron las actions (el botón de arriba)
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(
            height: 1,
            color: cs.outlineVariant.withValues(alpha: 0.3),
          ),
        ),
      ),
      // ✅ CAMBIO 2: Se agregó el FloatingActionButton
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreatePropertyDialog(context),
        backgroundColor: cs.primary,
        child: Icon(Icons.add, color: cs.onPrimary),
      ),
      body: SafeArea(
        child: Obx(() {
          final loading =
              controller.isLoading.value && controller.properties.isEmpty;
          final error = controller.errorMessage.value;

          if (loading) {
            return const Center(
              child: CircularProgressIndicator(strokeWidth: 2),
            );
          }

          return RefreshIndicator(
            color: cs.primary,
            backgroundColor: cs.surface,
            onRefresh: controller.fetchProperties,
            child: LayoutBuilder(
              builder: (context, c) {
                final width = c.maxWidth;

                final cross = width >= 1200
                    ? 3
                    : width >= 800
                    ? 2
                    : 1;

                // AJUSTE UX: Ratio ajustado para imágenes 4:3
                final cardAspect = cross == 1 ? 0.75 : 0.70;

                return CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    SliverToBoxAdapter(
                      child: _Header(
                        total: controller.total.value,
                        isLoading: controller.isLoading.value,
                      ),
                    ),

                    if (error != null) ...[
                      SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverToBoxAdapter(
                          child: _InlineError(
                            message: error,
                            onRetry: controller.fetchProperties,
                          ),
                        ),
                      ),
                    ],

                    if (controller.properties.isEmpty && error == null) ...[
                      const SliverFillRemaining(
                        hasScrollBody: false,
                        child: _EmptyState(
                          icon: Icons.grid_off,
                          title: 'Sin publicaciones aún',
                          subtitle:
                              'Cuando crees propiedades, aparecerán aquí.',
                        ),
                      ),
                    ] else ...[
                      SliverPadding(
                        padding: cross == 1
                            ? const EdgeInsets.only(bottom: 80)
                            : const EdgeInsets.fromLTRB(16, 0, 16, 80),
                        sliver: SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: cross,
                                mainAxisSpacing: 24,
                                crossAxisSpacing: 24,
                                childAspectRatio: cardAspect,
                              ),
                          delegate: SliverChildBuilderDelegate((context, i) {
                            final p = controller.properties[i];
                            return _Card(
                              id: p.id,
                              name: p.name,
                              address: (p.address?.isNotEmpty ?? false)
                                  ? p.address!
                                  : 'Sin ubicación',
                              units: p.totalUnits ?? 0,
                              isActive: p.isActive,
                              createdAt: controller.formatDate(p.createdAt),
                              imageUrl: p.logoUrl,
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
                                      useSafeArea: true,
                                      builder: (_) =>
                                          HorizontalPropertyUpdateSheet(
                                            propertyId: p.id,
                                          ),
                                    );

                                if (!context.mounted || result == null) return;
                                if (result.success)
                                  controller.fetchProperties();

                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      result.message ?? 'Actualizado',
                                    ),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              },
                              onDelete: () async {
                                if (controller.isDeleting(p.id)) return;
                                final ok = await showModalBottomSheet<bool>(
                                  context: context,
                                  builder: (ctx) => SafeArea(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        ListTile(
                                          leading: const Icon(
                                            Icons.delete_forever,
                                            color: Colors.red,
                                          ),
                                          title: const Text(
                                            'Eliminar propiedad',
                                            style: TextStyle(color: Colors.red),
                                          ),
                                          onTap: () => Navigator.pop(ctx, true),
                                        ),
                                        ListTile(
                                          leading: Icon(
                                            Icons.close,
                                            color: cs.onSurface,
                                          ),
                                          title: Text(
                                            'Cancelar',
                                            style: TextStyle(
                                              color: cs.onSurface,
                                            ),
                                          ),
                                          onTap: () =>
                                              Navigator.pop(ctx, false),
                                        ),
                                      ],
                                    ),
                                  ),
                                );

                                if (ok != true) return;
                                final res = await controller.deleteProperty(
                                  id: p.id,
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
    final cs = Theme.of(context).colorScheme;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return Obx(() {
          final isCreating = controller.isCreating.value;
          return AlertDialog(
            elevation: 0,
            backgroundColor: cs.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: Text(
              'Nueva Publicación',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: cs.onSurface,
              ),
            ),
            content: Form(
              key: controller.createFormKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: controller.createNameCtrl,
                    textCapitalization: TextCapitalization.words,
                    style: TextStyle(color: cs.onSurface),
                    decoration: InputDecoration(
                      hintText: 'Nombre de la propiedad...',
                      hintStyle: TextStyle(color: cs.onSurfaceVariant),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: cs.surfaceContainerHighest,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: controller.createAddressCtrl,
                    textCapitalization: TextCapitalization.sentences,
                    style: TextStyle(color: cs.onSurface),
                    decoration: InputDecoration(
                      hintText: 'Ubicación...',
                      hintStyle: TextStyle(color: cs.onSurfaceVariant),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: cs.surfaceContainerHighest,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 14,
                      ),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                  ),
                ],
              ),
            ),
            actionsAlignment: MainAxisAlignment.spaceEvenly,
            actions: [
              TextButton(
                onPressed: isCreating
                    ? null
                    : () => Navigator.of(dialogCtx).pop(),
                child: Text('Cancelar', style: TextStyle(color: cs.onSurface)),
              ),
              TextButton(
                onPressed: isCreating
                    ? null
                    : () async {
                        FocusScope.of(dialogCtx).unfocus();
                        final result = await controller.createProperty();
                        if (result.success) {
                          Navigator.of(dialogCtx).pop();
                          controller.fetchProperties();
                        }
                      },
                child: isCreating
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: cs.primary,
                        ),
                      )
                    : Text(
                        'Compartir',
                        style: TextStyle(
                          color: cs.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ],
          );
        });
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.total, required this.isLoading});
  final int total;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(2.5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: cs.primary, width: 2),
            ),
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: cs.surface,
                shape: BoxShape.circle,
              ),
              child: CircleAvatar(
                radius: 28,
                backgroundColor: cs.surfaceContainerHighest,
                child: Icon(Icons.apartment, color: cs.primary),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "RuPu Admin",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: cs.onSurface,
                  ),
                ),
                if (isLoading)
                  Text(
                    "Sincronizando...",
                    style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
                  )
                else
                  RichText(
                    text: TextSpan(
                      style: TextStyle(color: cs.onSurface, fontSize: 14),
                      children: [
                        const TextSpan(text: 'Gestionando '),
                        TextSpan(
                          text: '$total propiedades',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const TextSpan(text: ' horizontales.'),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({
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
  final String createdAt;
  final String? imageUrl;
  final VoidCallback onView;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final bool isDeleting;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final hasImage = imageUrl != null && imageUrl!.trim().isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        border: Border(
          bottom: BorderSide(color: cs.outlineVariant.withValues(alpha: 0.3)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Post Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: cs.surfaceContainerHighest,
                  backgroundImage: hasImage ? NetworkImage(imageUrl!) : null,
                  child: !hasImage
                      ? Text(
                          name.substring(0, 1).toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: cs.primary,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: cs.onSurface,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (address.isNotEmpty)
                        Text(
                          address,
                          style: TextStyle(
                            fontSize: 11,
                            color: cs.onSurfaceVariant,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: isDeleting
                      ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: cs.onSurface,
                          ),
                        )
                      : Icon(Icons.more_vert, color: cs.onSurface),
                  onPressed: onDelete,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          // Image Area (4:3 Ratio + BoxFit.fill)
          AspectRatio(
            aspectRatio: 4 / 3,
            child: GestureDetector(
              onTap: onView,
              child: Container(
                color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                width: double.infinity,
                child: hasImage
                    ? Image.network(
                        imageUrl!,
                        fit: BoxFit.fill, // Mantenemos tu preferencia
                        errorBuilder: (_, __, ___) => _PlaceholderImage(),
                      )
                    : _PlaceholderImage(),
              ),
            ),
          ),

          // Action Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                IconButton(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined, size: 24),
                  tooltip: 'Editar',
                ),
                const SizedBox(width: 16),
                IconButton(
                  onPressed: onView,
                  icon: const Icon(Icons.remove_red_eye_outlined, size: 24),
                  tooltip: 'Ver detalle',
                ),
                const Spacer(),
              ],
            ),
          ),

          // Status
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              isActive ? 'Estado: Activo' : 'Estado: Inactivo',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color: cs.onSurface,
              ),
            ),
          ),

          // Caption
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
            child: RichText(
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              text: TextSpan(
                style: TextStyle(color: cs.onSurface, fontSize: 13),
                children: [
                  TextSpan(
                    text: 'rupu_admin ',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextSpan(
                    text: '${name.trim()}. $units unidades en esta propiedad.',
                  ),
                ],
              ),
            ),
          ),

          // Date
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 2, 12, 12),
            child: Text(
              createdAt.toUpperCase(),
              style: TextStyle(
                color: cs.onSurfaceVariant,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Image.asset('assets/images/logorufu.png', width: 80));
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message, required this.onRetry});
  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        children: [
          Icon(Icons.error_outline, size: 40, color: cs.error),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: cs.onSurface),
          ),
          TextButton(
            onPressed: onRetry,
            child: Text(
              'Toca para reintentar',
              style: TextStyle(color: cs.primary),
            ),
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
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: cs.outline, width: 1.5),
              ),
              child: Icon(icon, size: 40, color: cs.onSurface),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: cs.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(color: cs.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
