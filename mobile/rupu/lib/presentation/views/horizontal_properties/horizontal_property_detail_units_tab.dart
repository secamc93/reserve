part of 'horizontal_property_detail_view.dart';

class _UnitsTab extends GetWidget<HorizontalPropertyUnitsController> {
  final String controllerTag;
  const _UnitsTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final unitsPage = controller.unitsPage.value;
      final isLoading = controller.unitsLoading.value;
      final isLoadingMore = controller.unitsLoadingMore.value;
      final error = controller.unitsErrorMessage.value;
      final units = List<HorizontalPropertyUnitItem>.of(controller.unitsItems);
      final total = unitsPage?.total ?? 0;
      final page = unitsPage?.page ?? 1;
      final totalPages = unitsPage?.totalPages ?? 1;

      return LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final crossAxis = width >= 1200
              ? 3
              : width >= 900
                  ? 2
                  : 1;
          final aspect = crossAxis == 1 ? 1.18 : 1.05;

          return RefreshIndicator(
            onRefresh: controller.refresh,
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is ScrollUpdateNotification &&
                    notification.metrics.pixels >=
                        notification.metrics.maxScrollExtent - 200 &&
                    !isLoading &&
                    !isLoadingMore &&
                    units.isNotEmpty &&
                    controller.canLoadMoreUnits) {
                  controller.loadMoreUnits();
                }
                return false;
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: _SectionCard(
                        title: 'Filtros de unidades',
                        child: _UnitsFiltersContent(controllerTag: controllerTag),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: _SummaryHeader(
                        title: 'Unidades encontradas: $total',
                        subtitle: 'Página $page de $totalPages',
                        showProgress: isLoading,
                        onRefresh: () {
                          controller.refresh();
                        },
                      ),
                    ),
                  ),
                  if (error != null)
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      sliver: SliverToBoxAdapter(
                        child: _InlineError(message: error),
                      ),
                    ),
                  if (!isLoading && units.isEmpty)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: _EmptyState(
                        icon: Icons.apartment_outlined,
                        title: 'No se encontraron unidades.',
                        subtitle:
                            'Ajusta los filtros o actualiza para intentar nuevamente.',
                      ),
                    )
                  else ...[
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                      sliver: SliverGrid(
                        gridDelegate:
                            SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxis,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: aspect,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) => _UnitCard(unit: units[index]),
                          childCount: units.length,
                        ),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 32),
                        child: Center(
                          child: isLoadingMore
                              ? const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child:
                                      CircularProgressIndicator(strokeWidth: 2.6),
                                )
                              : (!controller.canLoadMoreUnits &&
                                      units.isNotEmpty
                                  ? const Text(
                                      'No hay más unidades para cargar.',
                                    )
                                  : const SizedBox.shrink()),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      );
    });
  }
}

class _UnitsFiltersContent extends GetWidget<HorizontalPropertyUnitsController> {
  final String controllerTag;
  const _UnitsFiltersContent({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _FilterTextField(
              label: 'Página',
              controller: controller.unitsPageCtrl,
              width: 120,
              keyboardType: TextInputType.number,
            ),
            _FilterTextField(
              label: 'Tamaño de página',
              controller: controller.unitsPageSizeCtrl,
              width: 160,
              keyboardType: TextInputType.number,
            ),
            _FilterTextField(
              label: 'Número de unidad',
              controller: controller.unitsNumberCtrl,
            ),
            _FilterTextField(
              label: 'Bloque',
              controller: controller.unitsBlockCtrl,
            ),
            _FilterTextField(
              label: 'Tipo de unidad',
              controller: controller.unitsTypeCtrl,
            ),
            _FilterTextField(
              label: 'Buscar',
              controller: controller.unitsSearchCtrl,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => controller.applyUnitsFilters(),
            ),
            Obx(
              () => SizedBox(
                width: 200,
                child: DropdownButtonFormField<bool?>(
                  value: controller.unitsIsActive.value,
                  decoration: _filterDecoration(context, 'Estado'),
                  items: const [
                    DropdownMenuItem<bool?>(
                      value: null,
                      child: Text('Todos'),
                    ),
                    DropdownMenuItem<bool?>(
                      value: true,
                      child: Text('Activos'),
                    ),
                    DropdownMenuItem<bool?>(
                      value: false,
                      child: Text('Inactivos'),
                    ),
                  ],
                  onChanged: (value) {
                    controller.unitsIsActive.value = value;
                  },
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Align(
          alignment: Alignment.centerRight,
          child: Wrap(
            spacing: 12,
            runSpacing: 8,
            alignment: WrapAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () {
                  controller.clearUnitsFilters();
                  controller.applyUnitsFilters();
                },
                icon: const Icon(Icons.cleaning_services_outlined),
                label: const Text('Limpiar filtros'),
              ),
              FilledButton.icon(
                onPressed: controller.applyUnitsFilters,
                icon: const Icon(Icons.filter_alt_outlined),
                label: const Text('Aplicar filtros'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _UnitCard extends StatelessWidget {
  final HorizontalPropertyUnitItem unit;
  const _UnitCard({required this.unit});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final (bgChip, fgChip, labelChip) = unit.isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVA')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVA');

    return DecoratedBox(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .05),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  cs.primary.withValues(alpha: .14),
                  cs.surface,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: cs.primary.withValues(alpha: .15),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.apartment_outlined, color: cs.primary),
                    ),
                    const Spacer(),
                    _StatusChip(
                      label: labelChip,
                      background: bgChip,
                      foreground: fgChip,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Unidad ${unit.number}',
                  style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _DetailLine(
                    icon: Icons.location_city_outlined,
                    label: 'Bloque',
                    value: unit.block.isEmpty ? 'Sin bloque' : unit.block,
                  ),
                  _DetailLine(
                    icon: Icons.category_outlined,
                    label: 'Tipo de unidad',
                    value: unit.unitType.isEmpty ? 'Sin tipo' : unit.unitType,
                  ),
                  _DetailLine(
                    icon: Icons.straighten_outlined,
                    label: 'Coeficiente',
                    value: _formatCoefficient(unit.participationCoefficient),
                  ),
                  const Spacer(),
                  _CardActions(
                    onEdit: () => _showActionFeedback(
                      'Editar unidad',
                      'Funcionalidad disponible próximamente.',
                    ),
                    onDelete: () => _showActionFeedback(
                      'Eliminar unidad',
                      'Contacta al administrador para continuar con la acción.',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatCoefficient(double? value) {
    if (value == null) return '--';
    final hasDecimals = value.truncateToDouble() != value;
    return hasDecimals ? value.toStringAsFixed(2) : value.toStringAsFixed(0);
  }
}

class _DetailLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailLine({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: cs.primary.withValues(alpha: .08),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: 18, color: cs.primary),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: tt.labelSmall?.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value.isEmpty ? '—' : value,
                  style: tt.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
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
