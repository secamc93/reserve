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
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.refreshAll,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
          children: [
            if (error != null) _InlineError(message: error),

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

              _MetricsGrid(
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
                    value: (residentsController.residentsPage.value?.total ?? 0)
                        .toDouble(),
                    accent: cs.secondary,
                  ),
                  MetricItem(
                    icon: Icons.how_to_vote_outlined,
                    title: 'Grupos votación',
                    value: votingController.firstVotingGroupId?.toDouble() ?? 0,
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
    });
  }
}
