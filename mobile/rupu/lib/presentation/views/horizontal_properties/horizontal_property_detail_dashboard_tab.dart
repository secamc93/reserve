part of 'horizontal_property_detail_view.dart';

class _DashboardTab extends GetWidget<HorizontalPropertyDashboardController> {
  final String controllerTag;
  const _DashboardTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Obx(() {
      final detailController = controller.detailController;
      final detail = detailController.detail.value;
      final isLoading = detailController.isLoading.value;
      final error = detailController.errorMessage.value;
      final unitsController = controller.unitsController;
      final residentsController = controller.residentsController;
      final votingController = controller.votingController;

      if (isLoading && detail == null) {
        return const Center(child: RupuLoader());
      }

      return LayoutBuilder(
        builder: (context, constraints) {
          final isTablet = ResponsiveHelper.isTablet(context);
          final adaptivePadding = ResponsiveHelper.getAdaptivePadding(context);

          return RefreshIndicator(
            onRefresh: controller.refreshAll,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: adaptivePadding.copyWith(top: 16, bottom: 24),
              children: [
                if (error != null) ...[
                  _InlineError(message: error),
                  const SizedBox(height: 12),
                ],

                if (detail == null) ...[
                  const SizedBox(height: 36),
                  const _EmptyState(
                    icon: Icons.apartment_outlined,
                    title: 'No se encontró información de la propiedad.',
                    subtitle: 'Intenta actualizar o vuelve más tarde.',
                  ),
                ] else ...[
                  if (isLoading) const LinearProgressIndicator(minHeight: 2),
                  const SizedBox(height: 12),

                  // HEADER ESTILO "PERFIL" (INSPIRACIÓN INSTAGRAM)
                  _DashboardHeaderCard(
                    name: detail.name,
                    address: detail.address,
                    businessType: detail.businessTypeName,
                    totalUnits: detail.totalUnits ?? 0,
                    isTablet: isTablet,
                  ),

                  const SizedBox(height: 18),

                  // MÉTRICAS ESTILO "HIGHLIGHTS" / CHIPS
                  _DashboardMetricsStrip(
                    isTablet: isTablet,
                    items: [
                      MetricItem(
                        icon: Icons.apartment_outlined,
                        title: 'Unidades',
                        value: (unitsController.unitsPage.value?.total ?? 0)
                            .toDouble(),
                        accent: cs.primary,
                      ),
                      MetricItem(
                        icon: Icons.group_outlined,
                        title: 'Residentes',
                        value:
                            (residentsController.residentsPage.value?.total ??
                                    0)
                                .toDouble(),
                        accent: cs.secondary,
                      ),
                      MetricItem(
                        icon: Icons.how_to_vote_outlined,
                        title: 'Grupos votación',
                        value:
                            votingController.firstVotingGroupId?.toDouble() ??
                            0,
                        suffix: votingController.firstVotingGroupId == null
                            ? '--'
                            : null,
                        accent: cs.tertiary,
                      ),
                      MetricItem(
                        icon: Icons.monetization_on_outlined,
                        title: 'Cuotas',
                        value: 0,
                        suffix: '--',
                        accent: cs.error,
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // CARD DE INFORMACIÓN GENERAL (LOOK MÁS CUIDADO)
                  SectionCard(
                    title: 'Información general',
                    child: Column(
                      children: [
                        _InfoTile(
                          icon: Icons.business_outlined,
                          label: 'Nombre',
                          value: detail.name,
                        ),
                        _InfoTile(
                          icon: Icons.view_module_outlined,
                          label: 'Total de unidades',
                          value: (detail.totalUnits ?? 0).toString(),
                        ),
                        _InfoTile(
                          icon: Icons.place_outlined,
                          label: 'Dirección',
                          value: (detail.address?.isNotEmpty ?? false)
                              ? detail.address!
                              : '—',
                        ),
                        _InfoTile(
                          icon: Icons.store_mall_directory_outlined,
                          label: 'Tipo de negocio',
                          value: detail.businessTypeName ?? '—',
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      );
    });
  }
}

/// HEADER tipo perfil de Instagram: avatar, nombre, tipo y dirección
class _DashboardHeaderCard extends StatelessWidget {
  final String name;
  final String? address;
  final String? businessType;
  final int totalUnits;
  final bool isTablet;

  const _DashboardHeaderCard({
    required this.name,
    this.address,
    this.businessType,
    required this.totalUnits,
    required this.isTablet,
  });

  String get _initials {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '';
    if (parts.length == 1) {
      return parts.first.characters.take(2).toString().toUpperCase();
    }
    return (parts.first.characters.take(1).toString() +
            parts.last.characters.take(1).toString())
        .toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final addressText = (address?.isNotEmpty ?? false)
        ? address!
        : 'Sin dirección';

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isTablet ? 20 : 8,
        vertical: isTablet ? 18 : 14,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(isTablet ? 28 : 24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [cs.primary, cs.tertiary],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          // Avatar circular tipo Instagram
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [cs.primary, cs.secondary, cs.tertiary],
              ),
            ),
            child: CircleAvatar(
              radius: isTablet ? 30 : 26,
              backgroundColor: cs.surface,
              child: Text(
                _initials,
                style: tt.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: isTablet ? 20 : 18,
                  color: cs.onSurface,
                ),
              ),
            ),
          ),
          const SizedBox(width: 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Nombre de la propiedad
                Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    fontSize: isTablet ? 18 : 14,
                  ),
                ),
                const SizedBox(height: 8),
                // Tipo de negocio
                if (businessType != null && businessType!.isNotEmpty)
                  Text(
                    businessType!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.bodySmall?.copyWith(
                      color: Colors.white.withValues(alpha: 0.85),
                    ),
                  ),
                const SizedBox(height: 2),
                // Dirección
                Text(
                  addressText,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: tt.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          // const SizedBox(width: 1),
          // Pill de unidades (tipo contador de posts/seguidores)
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.6),
                    width: 0.8,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '$totalUnits',
                      style: tt.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        fontSize: isTablet ? 18 : 10,
                      ),
                    ),
                    Text(
                      'Unidades',
                      style: tt.labelSmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                        letterSpacing: 0.1,
                        fontSize: isTablet ? 18 : 10,
                      ),
                    ),
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

/// Tira / grid de métricas tipo "highlights"
class _DashboardMetricsStrip extends StatelessWidget {
  final List<MetricItem> items;
  final bool isTablet;

  const _DashboardMetricsStrip({required this.items, required this.isTablet});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    // En móvil: scroll horizontal tipo stories.
    if (!isTablet) {
      return SizedBox(
        height: 110,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final item = items[index];
            return _DashboardMetricChip(item: item, isCompact: true);
          },
        ),
      );
    }

    // En tablet: grid de 2 x N
    return GridView.builder(
      shrinkWrap: true,
      itemCount: items.length,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 2.7,
      ),
      itemBuilder: (context, index) {
        final item = items[index];
        return _DashboardMetricChip(item: item, isCompact: false);
      },
    );
  }
}

class _DashboardMetricChip extends StatelessWidget {
  final MetricItem item;
  final bool isCompact;

  const _DashboardMetricChip({required this.item, required this.isCompact});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final displayValue =
        item.suffix ??
        (item.value % 1 == 0
            ? item.value.toInt().toString()
            : item.value.toStringAsFixed(1));

    return Container(
      width: isCompact ? 150 : null,
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 12 : 14,
        vertical: isCompact ? 10 : 12,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            item.accent.withValues(alpha: 0.16),
            cs.surfaceContainerHighest.withValues(alpha: 0.04),
          ],
        ),
        border: Border.all(
          color: item.accent.withValues(alpha: 0.35),
          width: 0.9,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: item.accent.withValues(alpha: 0.16),
            ),
            child: Icon(
              item.icon,
              size: isCompact ? 18 : 20,
              color: item.accent,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: tt.labelSmall?.copyWith(
                    color: cs.onSurface.withValues(alpha: 0.7),
                    letterSpacing: 0.1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  displayValue,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: isCompact ? 16 : 18,
                    color: cs.onSurface,
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
