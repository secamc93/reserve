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

      final listContent = LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final crossAxis = width >= 1200
              ? 3
              : width >= 900
                  ? 2
                  : 1;

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
                      child: SectionCard(
                        title: 'Filtros de unidades',
                        child: _UnitsFiltersContent(
                          controllerTag: controllerTag,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: SummaryHeader(
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
                      sliver: crossAxis == 1
                          ? SliverList.builder(
                              itemCount: units.length,
                              itemBuilder: (context, index) => Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: _UnitCard(
                                  unit: units[index],
                                  controllerTag: controllerTag,
                                ),
                              ),
                            )
                          : SliverGrid(
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxis,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                                mainAxisExtent: 320,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (context, index) => _UnitCard(
                                  unit: units[index],
                                  controllerTag: controllerTag,
                                ),
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
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.6,
                                  ),
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

      final bottomPadding = MediaQuery.of(context).viewPadding.bottom;

      return Stack(
        children: [
          Positioned.fill(child: listContent),
          Positioned(
            right: 24,
            bottom: 24 + bottomPadding,
            child: _AddUnitFab(controllerTag: controllerTag),
          ),
        ],
      );
    });
  }
}

class _UnitsFiltersContent
    extends GetWidget<HorizontalPropertyUnitsController> {
  final String controllerTag;
  const _UnitsFiltersContent({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ResponsiveFormGrid(
          children: [
            FilterTextField(
              label: 'Página',
              controller: controller.unitsPageCtrl,
              keyboardType: TextInputType.number,
            ),
            FilterTextField(
              label: 'Tamaño de página',
              controller: controller.unitsPageSizeCtrl,
              keyboardType: TextInputType.number,
            ),
            FilterTextField(
              label: 'Número de unidad',
              controller: controller.unitsNumberCtrl,
            ),
            FilterTextField(
              label: 'Bloque',
              controller: controller.unitsBlockCtrl,
            ),
            FilterTextField(
              label: 'Tipo de unidad',
              controller: controller.unitsTypeCtrl,
            ),
            FilterTextField(
              label: 'Buscar',
              controller: controller.unitsSearchCtrl,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => controller.applyUnitsFilters(),
            ),
            Obx(
              () => DropdownButtonFormField<bool?>(
                initialValue: controller.unitsIsActive.value,
                decoration: _filterDecoration(context, 'Estado'),
                items: const [
                  DropdownMenuItem<bool?>(value: null, child: Text('Todos')),
                  DropdownMenuItem<bool?>(value: true, child: Text('Activos')),
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
          ],
        ),
        const SizedBox(height: 12),
        Obx(() {
          final _ = controller.filtersRevision.value;
          final chips = _buildActiveFilters();
          return AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            child: chips.isEmpty
                ? const SizedBox.shrink()
                : Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: _ActiveFiltersBar(
                      filters: chips,
                      onClearAll: () {
                        controller.clearUnitsFilters();
                        controller.applyUnitsFilters();
                      },
                    ),
                  ),
          );
        }),
        const SizedBox(height: 16),
        Obx(() {
          final busy =
              controller.unitsLoading.value ||
              controller.unitsLoadingMore.value;
          return _FilterActionsRow(
            onClear: () {
              controller.clearUnitsFilters();
              controller.applyUnitsFilters();
            },
            onApply: () => controller.applyUnitsFilters(),
            isBusy: busy,
          );
        }),
      ],
    );
  }

  List<_ActiveFilterChipData> _buildActiveFilters() {
    final filters = <_ActiveFilterChipData>[];
    final page = controller.unitsPageCtrl.text.trim();
    if (page.isNotEmpty && page != '1') {
      filters.add(
        _ActiveFilterChipData(
          label: 'Página $page',
          onRemove: () {
            controller.unitsPageCtrl.text = '1';
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final pageSize = controller.unitsPageSizeCtrl.text.trim();
    if (pageSize.isNotEmpty && pageSize != '12') {
      filters.add(
        _ActiveFilterChipData(
          label: 'Tamaño $pageSize',
          onRemove: () {
            controller.unitsPageSizeCtrl.text = '12';
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final number = controller.unitsNumberCtrl.text.trim();
    if (number.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Unidad $number',
          onRemove: () {
            controller.unitsNumberCtrl.clear();
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final block = controller.unitsBlockCtrl.text.trim();
    if (block.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Bloque $block',
          onRemove: () {
            controller.unitsBlockCtrl.clear();
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final unitType = controller.unitsTypeCtrl.text.trim();
    if (unitType.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Tipo $unitType',
          onRemove: () {
            controller.unitsTypeCtrl.clear();
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final search = controller.unitsSearchCtrl.text.trim();
    if (search.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Busca "$search"',
          onRemove: () {
            controller.unitsSearchCtrl.clear();
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    final status = controller.unitsIsActive.value;
    if (status != null) {
      filters.add(
        _ActiveFilterChipData(
          label: status ? 'Activas' : 'Inactivas',
          onRemove: () {
            controller.unitsIsActive.value = null;
            controller.applyUnitsFilters();
          },
        ),
      );
    }
    return filters;
  }
}

class _AddUnitFab extends GetWidget<HorizontalPropertyUnitsController> {
  final String controllerTag;
  const _AddUnitFab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Obx(() {
      final isBusy = controller.unitMutationBusy.value;
      final gradientColors = isBusy
          ? [
              cs.primary.withValues(alpha: .45),
              cs.secondary.withValues(alpha: .45),
            ]
          : [cs.primary, cs.secondary];
      final shadowColor = cs.primary.withValues(alpha: isBusy ? .18 : .32);

      final labelStyle = tt.labelLarge?.copyWith(
        fontWeight: FontWeight.w800,
        color: cs.onPrimary,
      );

      final label = isBusy
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: cs.onPrimary,
                  ),
                ),
                const SizedBox(width: 12),
                Text('Procesando...', style: labelStyle),
              ],
            )
          : Text('Agregar unidad', style: labelStyle);

      return Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: 18,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          heroTag: 'add-unit-$controllerTag',
          elevation: 0,
          backgroundColor: Colors.transparent,
          foregroundColor: cs.onPrimary,
          onPressed: isBusy ? null : () => _openCreateSheet(context),
          icon: isBusy ? null : const Icon(Icons.add, size: 24),
          label: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: label,
          ),
        ),
      );
    });
  }

  Future<void> _openCreateSheet(BuildContext context) async {
    final result = await showModalBottomSheet<
        HorizontalPropertyUnitDetailResult>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => _UnitFormBottomSheet(
        title: 'Agregar nueva unidad',
        actionLabel: 'Crear unidad',
        onSubmit: (payload) => controller.createUnit(data: payload),
      ),
    );

    if (result != null && result.success) {
      final number = result.unit?.number;
      final message = (number == null || number.isEmpty)
          ? 'La unidad se registró correctamente.'
          : 'La unidad $number se registró correctamente.';
      _showSnack('Unidad creada', message);
    }
  }
}

class _UnitCard extends StatelessWidget {
  final HorizontalPropertyUnitItem unit;
  final String controllerTag;
  const _UnitCard({required this.unit, required this.controllerTag});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final unitsController =
        Get.find<HorizontalPropertyUnitsController>(tag: controllerTag);

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
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
              ),
              gradient: LinearGradient(
                colors: [cs.primary.withValues(alpha: .14), cs.surface],
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
          Padding(
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
                  label: 'CoeficieXnte',
                  value: _formatCoefficient(unit.participationCoefficient),
                ),
                Obx(() {
                  final isDeleting =
                      unitsController.deletingUnitIds.contains(unit.id);
                  final disableEdition = unitsController.unitMutationBusy.value;
                  return _CardActions(
                    onView: () => _openDetailSheet(context),
                    onEdit: disableEdition
                        ? null
                        : () => _openEditSheet(context),
                    onDelete:
                        isDeleting ? null : () => _confirmDelete(context),
                    isEditDisabled: disableEdition,
                    isDeleteDisabled: disableEdition,
                    showDeleteLoader: isDeleting,
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _openDetailSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => _UnitDetailBottomSheet(
        controllerTag: controllerTag,
        unit: unit,
      ),
    );
  }

  Future<void> _openEditSheet(BuildContext context) async {
    final result = await showModalBottomSheet<
        HorizontalPropertyUnitDetailResult>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => _UnitEditBottomSheet(
        controllerTag: controllerTag,
        unit: unit,
      ),
    );

    if (result != null && result.success) {
      final updatedNumber = result.unit?.number ?? unit.number;
      final message =
          'Los cambios de la unidad $updatedNumber se guardaron correctamente.';
      _showSnack('Unidad actualizada', message);
    }
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final cs = Theme.of(context).colorScheme;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Eliminar unidad'),
        content: Text(
          '¿Quieres eliminar la unidad ${unit.number}? Esta acción no se puede deshacer.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: cs.error,
              foregroundColor: cs.onError,
            ),
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final controller =
        Get.find<HorizontalPropertyUnitsController>(tag: controllerTag);
    final actionResult = await controller.deleteUnit(unit.id);

    if (actionResult.success) {
      final message = (actionResult.message?.isNotEmpty ?? false)
          ? actionResult.message!
          : 'La unidad ${unit.number} se eliminó correctamente.';
      _showSnack('Unidad eliminada', message);
    } else {
      _showSnack(
        'No se pudo eliminar',
        actionResult.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
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
                  style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _UnitDetailBottomSheet extends StatefulWidget {
  final String controllerTag;
  final HorizontalPropertyUnitItem unit;

  const _UnitDetailBottomSheet({
    required this.controllerTag,
    required this.unit,
  });

  @override
  State<_UnitDetailBottomSheet> createState() =>
      _UnitDetailBottomSheetState();
}

class _UnitDetailBottomSheetState extends State<_UnitDetailBottomSheet> {
  late Future<HorizontalPropertyUnitDetailResult> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<HorizontalPropertyUnitDetailResult> _load() {
    final controller =
        Get.find<HorizontalPropertyUnitsController>(tag: widget.controllerTag);
    return controller.fetchUnitDetail(widget.unit.id);
  }

  void _retry() {
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets;
    final cs = Theme.of(context).colorScheme;

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child:
                        FutureBuilder<HorizontalPropertyUnitDetailResult>(
                      future: _future,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState !=
                            ConnectionState.done) {
                          return const _UnitDetailLoading();
                        }
                        if (!snapshot.hasData) {
                          return _UnitDetailError(
                            message:
                                'No se pudo obtener la información de la unidad.',
                            onRetry: _retry,
                          );
                        }
                        final result = snapshot.data!;
                        if (!result.success || result.unit == null) {
                          return _UnitDetailError(
                            message: result.message ??
                                'No se pudo obtener la información de la unidad.',
                            onRetry: _retry,
                          );
                        }
                        return _UnitDetailContent(
                          detail: result.unit!,
                          fallback: widget.unit,
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _UnitEditBottomSheet extends StatefulWidget {
  final String controllerTag;
  final HorizontalPropertyUnitItem unit;

  const _UnitEditBottomSheet({
    required this.controllerTag,
    required this.unit,
  });

  @override
  State<_UnitEditBottomSheet> createState() => _UnitEditBottomSheetState();
}

class _UnitEditBottomSheetState extends State<_UnitEditBottomSheet> {
  late Future<HorizontalPropertyUnitDetailResult> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<HorizontalPropertyUnitDetailResult> _load() {
    final controller =
        Get.find<HorizontalPropertyUnitsController>(tag: widget.controllerTag);
    return controller.fetchUnitDetail(widget.unit.id);
  }

  void _retry() {
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller =
        Get.find<HorizontalPropertyUnitsController>(tag: widget.controllerTag);

    return FutureBuilder<HorizontalPropertyUnitDetailResult>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const _UnitFormLoadingSheet();
        }

        if (!snapshot.hasData) {
          return _UnitFormErrorSheet(
            onRetry: _retry,
          );
        }

        final result = snapshot.data!;
        if (!result.success || result.unit == null) {
          return _UnitFormErrorSheet(
            message: result.message ??
                'No se pudo obtener la información de la unidad.',
            onRetry: _retry,
          );
        }

        return _UnitFormBottomSheet(
          title: 'Editar unidad',
          actionLabel: 'Guardar cambios',
          initialDetail: result.unit,
          fallback: widget.unit,
          showStatusSwitch: true,
          onSubmit: (payload) => controller.updateUnit(
            unitId: widget.unit.id,
            data: payload,
          ),
        );
      },
    );
  }
}

class _UnitFormScaffold extends StatelessWidget {
  final Widget child;
  final double heightFactor;

  const _UnitFormScaffold({
    required this.child,
    this.heightFactor = 0.95,
  });

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets;
    final cs = Theme.of(context).colorScheme;

    return FractionallySizedBox(
      heightFactor: heightFactor,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(child: child),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _UnitFormLoadingSheet extends StatelessWidget {
  const _UnitFormLoadingSheet();

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return _UnitFormScaffold(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: cs.primary.withValues(alpha: .12),
                shape: BoxShape.circle,
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: CircularProgressIndicator(color: cs.primary),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Cargando unidad…',
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              'Obteniendo la información más reciente de la unidad para continuar.',
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _UnitFormErrorSheet extends StatelessWidget {
  final String? message;
  final VoidCallback onRetry;

  const _UnitFormErrorSheet({
    this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return _UnitFormScaffold(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: cs.errorContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.error_outline, color: cs.error, size: 28),
            ),
            const SizedBox(height: 24),
            Text(
              'No se pudo cargar la unidad',
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message ??
                  'Ocurrió un problema al obtener la información. Inténtalo nuevamente.',
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reintentar'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _UnitFormBottomSheet extends StatefulWidget {
  final String title;
  final String actionLabel;
  final HorizontalPropertyUnitDetail? initialDetail;
  final HorizontalPropertyUnitItem? fallback;
  final bool showStatusSwitch;
  final Future<HorizontalPropertyUnitDetailResult> Function(
      Map<String, dynamic> data)
      onSubmit;

  const _UnitFormBottomSheet({
    required this.title,
    required this.actionLabel,
    required this.onSubmit,
    this.initialDetail,
    this.fallback,
    this.showStatusSwitch = false,
  });

  @override
  State<_UnitFormBottomSheet> createState() => _UnitFormBottomSheetState();
}

class _UnitFormBottomSheetState extends State<_UnitFormBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _numberCtrl;
  late final TextEditingController _blockCtrl;
  late final TextEditingController _unitTypeCtrl;
  late final TextEditingController _floorCtrl;
  late final TextEditingController _areaCtrl;
  late final TextEditingController _bedroomsCtrl;
  late final TextEditingController _bathroomsCtrl;
  late final TextEditingController _coefficientCtrl;
  late final TextEditingController _descriptionCtrl;
  bool _isActive = true;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final detail = widget.initialDetail;
    final fallback = widget.fallback;

    _numberCtrl = TextEditingController(
      text: detail?.number ?? fallback?.number ?? '',
    );
    _blockCtrl = TextEditingController(
      text: detail?.block ?? fallback?.block ?? '',
    );
    _unitTypeCtrl = TextEditingController(
      text: detail?.unitType ?? fallback?.unitType ?? '',
    );
    _floorCtrl = TextEditingController(
      text: detail?.floor?.toString() ?? '',
    );
    _areaCtrl = TextEditingController(
      text: _doubleToText(detail?.area),
    );
    _bedroomsCtrl = TextEditingController(
      text: detail?.bedrooms?.toString() ?? '',
    );
    _bathroomsCtrl = TextEditingController(
      text: detail?.bathrooms?.toString() ?? '',
    );
    _coefficientCtrl = TextEditingController(
      text: _doubleToText(
        detail?.participationCoefficient ?? fallback?.participationCoefficient,
      ),
    );
    _descriptionCtrl = TextEditingController(
      text: detail?.description ?? '',
    );
    _isActive = detail?.isActive ?? fallback?.isActive ?? true;
  }

  @override
  void dispose() {
    _numberCtrl.dispose();
    _blockCtrl.dispose();
    _unitTypeCtrl.dispose();
    _floorCtrl.dispose();
    _areaCtrl.dispose();
    _bedroomsCtrl.dispose();
    _bathroomsCtrl.dispose();
    _coefficientCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  String _doubleToText(double? value) {
    if (value == null) return '';
    if (value.truncateToDouble() == value) {
      return value.toStringAsFixed(0);
    }
    return value.toString();
  }

  int? _parseInt(String value) {
    if (value.isEmpty) return null;
    return int.tryParse(value);
  }

  double? _parseDouble(String value) {
    if (value.isEmpty) return null;
    final normalized = value.replaceAll(',', '.');
    return double.tryParse(normalized);
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'number': _numberCtrl.text.trim(),
      'block': _emptyToNull(_blockCtrl.text.trim()),
      'unit_type': _unitTypeCtrl.text.trim(),
      'floor': _parseInt(_floorCtrl.text.trim()),
      'area': _parseDouble(_areaCtrl.text.trim()),
      'bedrooms': _parseInt(_bedroomsCtrl.text.trim()),
      'bathrooms': _parseInt(_bathroomsCtrl.text.trim()),
      'participation_coefficient':
          _parseDouble(_coefficientCtrl.text.trim()),
      'description': _emptyToNull(_descriptionCtrl.text.trim()),
    };

    if (widget.showStatusSwitch) {
      payload['is_active'] = _isActive;
    }

    payload.removeWhere((key, value) => value == null);
    return payload;
  }

  String? _emptyToNull(String value) => value.isEmpty ? null : value;

  Future<void> _handleSubmit() async {
    if (_saving) return;
    final formState = _formKey.currentState;
    if (formState == null || !formState.validate()) {
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.onSubmit(_buildPayload());
      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _saving = false;
          _errorMessage =
              result.message ?? 'No se pudo guardar la unidad. Inténtalo más tarde.';
        });
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _errorMessage =
            'Ocurrió un error al guardar la unidad. Inténtalo nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    InputDecoration decoration(String label, {String? hint}) {
      return InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: cs.surfaceContainerHighest,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: cs.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: cs.primary.withValues(alpha: .5)),
        ),
      );
    }

    Widget field({
      required String label,
      required TextEditingController controller,
      String? hint,
      TextInputType keyboardType = TextInputType.text,
      String? Function(String?)? validator,
    }) {
      return TextFormField(
        controller: controller,
        decoration: decoration(label, hint: hint),
        keyboardType: keyboardType,
        textInputAction: TextInputAction.next,
        validator: validator,
      );
    }

    return _UnitFormScaffold(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 10, 24, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.title,
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Completa la información de la unidad para continuar.',
                  style: tt.bodyMedium?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ResponsiveFormGrid(
                      children: [
                        field(
                          label: 'Número de unidad',
                          controller: _numberCtrl,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Ingresa el número de la unidad';
                            }
                            return null;
                          },
                        ),
                        field(
                          label: 'Tipo de unidad',
                          controller: _unitTypeCtrl,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Indica el tipo de unidad';
                            }
                            return null;
                          },
                        ),
                        field(
                          label: 'Bloque',
                          controller: _blockCtrl,
                          hint: 'Bloque o torre',
                        ),
                        field(
                          label: 'Piso',
                          controller: _floorCtrl,
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return null;
                            }
                            return _parseInt(value.trim()) == null
                                ? 'Ingresa un número válido'
                                : null;
                          },
                        ),
                        field(
                          label: 'Área (m²)',
                          controller: _areaCtrl,
                          keyboardType:
                              const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return null;
                            }
                            return _parseDouble(value.trim()) == null
                                ? 'Ingresa un valor numérico'
                                : null;
                          },
                        ),
                        field(
                          label: 'Coeficiente de participación',
                          controller: _coefficientCtrl,
                          keyboardType:
                              const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return null;
                            }
                            return _parseDouble(value.trim()) == null
                                ? 'Ingresa un valor numérico'
                                : null;
                          },
                        ),
                        field(
                          label: 'Habitaciones',
                          controller: _bedroomsCtrl,
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return null;
                            }
                            return _parseInt(value.trim()) == null
                                ? 'Ingresa un número válido'
                                : null;
                          },
                        ),
                        field(
                          label: 'Baños',
                          controller: _bathroomsCtrl,
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return null;
                            }
                            return _parseInt(value.trim()) == null
                                ? 'Ingresa un número válido'
                                : null;
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionCtrl,
                      decoration: decoration(
                        'Descripción',
                        hint: 'Comparte detalles adicionales de la unidad',
                      ),
                      textInputAction: TextInputAction.newline,
                      keyboardType: TextInputType.multiline,
                      maxLines: 3,
                    ),
                    if (widget.showStatusSwitch) ...[
                      const SizedBox(height: 8),
                      SwitchListTile.adaptive(
                        value: _isActive,
                        onChanged: _saving
                            ? null
                            : (value) {
                                setState(() {
                                  _isActive = value;
                                });
                              },
                        title: const Text('Unidad activa'),
                        subtitle: const Text(
                          'Controla si la unidad permanece visible en la administración.',
                        ),
                      ),
                    ],
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cs.errorContainer,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.error_outline, color: cs.error),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: tt.bodyMedium?.copyWith(
                                  color: cs.onErrorContainer,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _saving
                                ? null
                                : () => Navigator.of(context).pop(),
                            child: const Text('Cancelar'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: _saving ? null : _handleSubmit,
                            icon: _saving
                                ? SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.2,
                                      color: cs.onPrimary,
                                    ),
                                  )
                                : const Icon(Icons.save_outlined),
                            label: Text(
                              _saving ? 'Guardando...' : widget.actionLabel,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }


class _UnitDetailLoading extends StatelessWidget {
  const _UnitDetailLoading();

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            height: 54,
            width: 54,
            child: CircularProgressIndicator(color: cs.primary, strokeWidth: 3),
          ),
          const SizedBox(height: 20),
          Text(
            'Cargando detalles de la unidad...',
            style: tt.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: cs.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _UnitDetailError extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _UnitDetailError({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: cs.error),
          const SizedBox(height: 16),
          Text(
            'Ups, algo salió mal',
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Intentar de nuevo'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.of(context).maybePop(),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}

void _showSnack(String title, String message, {bool isError = false}) {
  final cs = Get.theme.colorScheme;
  if (Get.isSnackbarOpen) {
    Get.closeCurrentSnackbar();
  }
  Get.snackbar(
    title,
    message,
    snackPosition: SnackPosition.BOTTOM,
    duration: const Duration(seconds: 3),
    margin: const EdgeInsets.all(16),
    backgroundColor: isError ? cs.errorContainer : cs.primaryContainer,
    colorText: isError ? cs.onErrorContainer : cs.onPrimaryContainer,
    icon: Icon(
      isError ? Icons.error_outline : Icons.check_circle_outline,
      color: isError ? cs.error : cs.primary,
    ),
  );
}

class _UnitDetailContent extends StatelessWidget {
  final HorizontalPropertyUnitDetail detail;
  final HorizontalPropertyUnitItem fallback;

  const _UnitDetailContent({
    required this.detail,
    required this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    final isActive = detail.isActive ?? fallback.isActive;
    final (statusBg, statusFg, statusLabel) = isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVA')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVA');

    final metrics = <_MetricTileData>[
      _MetricTileData(
        icon: Icons.confirmation_number_outlined,
        label: 'ID de unidad',
        value: detail.id.toString(),
      ),
      _MetricTileData(
        icon: Icons.tag_outlined,
        label: 'Número de unidad',
        value: _formatText(
          detail.number.isNotEmpty ? detail.number : fallback.number,
        ),
      ),
      if (detail.businessId != null)
        _MetricTileData(
          icon: Icons.business_outlined,
          label: 'ID del negocio',
          value: detail.businessId!.toString(),
        ),
      if ((detail.block ?? fallback.block).trim().isNotEmpty)
        _MetricTileData(
          icon: Icons.apartment_rounded,
          label: 'Bloque',
          value: _formatText(detail.block ?? fallback.block),
        ),
      if ((detail.tower ?? '').trim().isNotEmpty)
        _MetricTileData(
          icon: Icons.domain_add_outlined,
          label: 'Torre',
          value: _formatText(detail.tower),
        ),
      if ((detail.unitType ?? fallback.unitType).trim().isNotEmpty)
        _MetricTileData(
          icon: Icons.category_outlined,
          label: 'Tipo de unidad',
          value: _formatText(detail.unitType ?? fallback.unitType),
        ),
      _MetricTileData(
        icon: Icons.stairs_outlined,
        label: 'Piso',
        value: _formatInt(detail.floor),
      ),
      _MetricTileData(
        icon: Icons.square_foot_outlined,
        label: 'Área',
        value: _formatArea(detail.area),
      ),
      _MetricTileData(
        icon: Icons.meeting_room_outlined,
        label: 'Habitaciones',
        value: _formatInt(detail.bedrooms),
      ),
      _MetricTileData(
        icon: Icons.bathtub_outlined,
        label: 'Baños',
        value: _formatInt(detail.bathrooms),
      ),
      _MetricTileData(
        icon: Icons.balance_outlined,
        label: 'Coeficiente',
        value: _formatCoefficientValue(detail.participationCoefficient),
      ),
      if ((detail.description ?? '').trim().isNotEmpty)
        _MetricTileData(
          icon: Icons.description_outlined,
          label: 'Descripción',
          value: _formatText(detail.description),
        ),
      if (detail.createdAt != null)
        _MetricTileData(
          icon: Icons.calendar_today_outlined,
          label: 'Creada el',
          value: _formatDateTime(detail.createdAt),
        ),
      if (detail.updatedAt != null)
        _MetricTileData(
          icon: Icons.update_outlined,
          label: 'Actualizada el',
          value: _formatDateTime(detail.updatedAt),
        ),
    ];

    final extras = detail.extraAttributes.entries
        .where((entry) {
          final value = entry.value;
          if (value == null) return false;
          if (value is bool || value is num) return true;
          if (value is String) return value.trim().isNotEmpty;
          return false;
        })
        .toList()
      ..sort((a, b) => a.key.compareTo(b.key));

    return Scrollbar(
      thumbVisibility: true,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: LinearGradient(
                  colors: [
                    cs.primary.withValues(alpha: .1),
                    cs.surface,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: cs.outlineVariant.withValues(alpha: .6)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: cs.primary.withValues(alpha: .16),
                        ),
                        alignment: Alignment.center,
                        child:
                            Icon(Icons.apartment_outlined, color: cs.primary),
                      ),
                      const SizedBox(width: 18),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Unidad ${_formatText(detail.number.isNotEmpty ? detail.number : fallback.number)}',
                              style: tt.titleLarge?.copyWith(
                                fontWeight: FontWeight.w800,
                                letterSpacing: -.3,
                              ),
                            ),
                            const SizedBox(height: 6),
                            if ((detail.unitType ?? fallback.unitType)
                                .trim()
                                .isNotEmpty)
                              Text(
                                _formatText(detail.unitType ?? fallback.unitType),
                                style: tt.bodyMedium?.copyWith(
                                  color: cs.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                          ],
                        ),
                      ),
                      _StatusChip(
                        label: statusLabel,
                        background: statusBg,
                        foreground: statusFg,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      if ((detail.block ?? fallback.block).trim().isNotEmpty)
                        _InfoChip(
                          icon: Icons.domain_outlined,
                          label:
                              'Bloque ${_formatText(detail.block ?? fallback.block)}',
                        ),
                      if ((detail.tower ?? '').trim().isNotEmpty)
                        _InfoChip(
                          icon: Icons.location_city_outlined,
                          label: 'Torre ${_formatText(detail.tower)}',
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            if (metrics.isNotEmpty)
              LayoutBuilder(
                builder: (context, constraints) {
                  final width = constraints.maxWidth;
                  double tileWidth;
                  if (width >= 840) {
                    tileWidth = (width - 24) / 3;
                  } else if (width >= 520) {
                    tileWidth = (width - 12) / 2;
                  } else {
                    tileWidth = width;
                  }
                  tileWidth = tileWidth.clamp(180, width);
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      for (final metric in metrics)
                        SizedBox(
                          width: tileWidth,
                          child: _MetricTile(data: metric),
                        ),
                    ],
                  );
                },
              ),
            if (detail.owner != null) ...[
              const SizedBox(height: 32),
              const _SectionTitle(
                icon: Icons.badge_outlined,
                title: 'Propietario',
              ),
              const SizedBox(height: 14),
              _ContactTile(contact: detail.owner!, accent: cs.primary),
            ],
            if (detail.residents.isNotEmpty) ...[
              const SizedBox(height: 32),
              const _SectionTitle(
                icon: Icons.groups_2_outlined,
                title: 'Residentes',
              ),
              const SizedBox(height: 14),
              ...detail.residents.map(
                (resident) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _ContactTile(
                    contact: resident,
                    accent: cs.secondary,
                  ),
                ),
              ),
            ],
            if (detail.vehicles.isNotEmpty) ...[
              const SizedBox(height: 32),
              const _SectionTitle(
                icon: Icons.directions_car_filled_outlined,
                title: 'Vehículos asociados',
              ),
              const SizedBox(height: 14),
              ...detail.vehicles.map(
                (vehicle) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _VehicleTile(vehicle: vehicle),
                ),
              ),
            ],
            if (detail.pets.isNotEmpty) ...[
              const SizedBox(height: 32),
              const _SectionTitle(
                icon: Icons.pets_outlined,
                title: 'Mascotas registradas',
              ),
              const SizedBox(height: 14),
              ...detail.pets.map(
                (pet) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PetTile(pet: pet),
                ),
              ),
            ],
            if (extras.isNotEmpty) ...[
              const SizedBox(height: 32),
              const _SectionTitle(
                icon: Icons.info_outline,
                title: 'Información adicional',
              ),
              const SizedBox(height: 12),
              ...extras.map(
                (entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ExtraAttributeTile(
                    label: _beautifyKey(entry.key),
                    value: _formatExtraValue(entry.value),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionTitle({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: cs.primary.withValues(alpha: .1),
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: cs.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
      ],
    );
  }
}

class _MetricTileData {
  final IconData icon;
  final String label;
  final String value;

  const _MetricTileData({
    required this.icon,
    required this.label,
    required this.value,
  });
}

class _MetricTile extends StatelessWidget {
  final _MetricTileData data;

  const _MetricTile({required this.data});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: .6)),
        color: cs.surfaceVariant.withValues(alpha: .32),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: cs.primary.withValues(alpha: .15),
            ),
            alignment: Alignment.center,
            child: Icon(data.icon, color: cs.primary, size: 20),
          ),
          const SizedBox(height: 14),
          Text(
            data.label,
            style: tt.labelSmall?.copyWith(
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w700,
              letterSpacing: .3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            data.value,
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _IconTextPair {
  final IconData icon;
  final String text;
  const _IconTextPair(this.icon, this.text);
}

class _ContactTile extends StatelessWidget {
  final HorizontalPropertyUnitContact contact;
  final Color accent;

  const _ContactTile({required this.contact, required this.accent});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final details = <_IconTextPair>[];
    if ((contact.document ?? '').trim().isNotEmpty) {
      details.add(_IconTextPair(Icons.credit_card, contact.document!.trim()));
    }
    if ((contact.phone ?? '').trim().isNotEmpty) {
      details.add(_IconTextPair(Icons.call_outlined, contact.phone!.trim()));
    }
    if ((contact.email ?? '').trim().isNotEmpty) {
      details.add(
        _IconTextPair(Icons.alternate_email, contact.email!.trim()),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          colors: [
            accent.withValues(alpha: .12),
            cs.surface,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: accent.withValues(alpha: .3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: accent.withValues(alpha: .2),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.person_outline, color: accent),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatText(contact.name ?? 'Sin nombre'),
                      style: tt.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if ((contact.role ?? '').trim().isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        contact.role!.trim(),
                        style: tt.bodySmall?.copyWith(
                          color: accent.withValues(alpha: .9),
                          fontWeight: FontWeight.w700,
                          letterSpacing: .3,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (details.isNotEmpty) ...[
            const SizedBox(height: 16),
            ...details.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _InfoRow(
                  icon: item.icon,
                  text: item.text,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _VehicleTile extends StatelessWidget {
  final HorizontalPropertyUnitVehicle vehicle;

  const _VehicleTile({required this.vehicle});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final details = <_IconTextPair>[];
    if ((vehicle.plate ?? '').trim().isNotEmpty) {
      details.add(
        _IconTextPair(Icons.confirmation_number_outlined, vehicle.plate!.trim()),
      );
    }
    if ((vehicle.model ?? '').trim().isNotEmpty) {
      details.add(
        _IconTextPair(Icons.directions_car_outlined, vehicle.model!.trim()),
      );
    }
    if ((vehicle.color ?? '').trim().isNotEmpty) {
      details.add(
        _IconTextPair(Icons.color_lens_outlined, vehicle.color!.trim()),
      );
    }
    if ((vehicle.parkingNumber ?? '').trim().isNotEmpty) {
      details.add(
        _IconTextPair(Icons.local_parking_outlined, vehicle.parkingNumber!.trim()),
      );
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: cs.tertiaryContainer.withValues(alpha: .35),
        border: Border.all(color: cs.tertiary.withValues(alpha: .25)),
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
                  shape: BoxShape.circle,
                  color: cs.tertiary.withValues(alpha: .2),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.directions_car, color: cs.tertiary),
              ),
              const SizedBox(width: 14),
              Text(
                _formatText(vehicle.model ?? vehicle.plate ?? 'Vehículo'),
                style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          if (details.isNotEmpty) ...[
            const SizedBox(height: 14),
            ...details.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: _InfoRow(icon: item.icon, text: item.text),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PetTile extends StatelessWidget {
  final HorizontalPropertyUnitPet pet;

  const _PetTile({required this.pet});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final details = <_IconTextPair>[];
    if ((pet.type ?? '').trim().isNotEmpty) {
      details.add(_IconTextPair(Icons.pets, pet.type!.trim()));
    }
    if ((pet.breed ?? '').trim().isNotEmpty) {
      details.add(_IconTextPair(Icons.badge_outlined, pet.breed!.trim()));
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: cs.secondaryContainer.withValues(alpha: .32),
        border: Border.all(color: cs.secondary.withValues(alpha: .25)),
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
                  shape: BoxShape.circle,
                  color: cs.secondary.withValues(alpha: .18),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.pets, color: cs.secondary),
              ),
              const SizedBox(width: 14),
              Text(
                _formatText(pet.name ?? 'Mascota'),
                style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          if (details.isNotEmpty) ...[
            const SizedBox(height: 14),
            ...details.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: _InfoRow(icon: item.icon, text: item.text),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ExtraAttributeTile extends StatelessWidget {
  final String label;
  final String value;

  const _ExtraAttributeTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: .5)),
        color: cs.surfaceVariant.withValues(alpha: .25),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
                const SizedBox(height: 4),
                Text(
                  value,
                  style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: cs.primary.withValues(alpha: .12),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(icon, size: 16, color: cs.primary),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: ShapeDecoration(
        color: cs.primary.withValues(alpha: .1),
        shape: StadiumBorder(
          side: BorderSide(color: cs.primary.withValues(alpha: .25)),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: cs.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: cs.primary,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _SheetHandle extends StatelessWidget {
  const _SheetHandle();

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: 56,
      height: 6,
      decoration: ShapeDecoration(
        color: cs.outlineVariant.withValues(alpha: .7),
        shape: const StadiumBorder(),
      ),
    );
  }
}

String _formatText(String? value) {
  if (value == null) return '—';
  final trimmed = value.trim();
  return trimmed.isEmpty ? '—' : trimmed;
}

String _formatInt(int? value) {
  if (value == null) return '—';
  return value.toString();
}

String _formatArea(double? area) {
  if (area == null) return '—';
  final hasDecimals = area.truncateToDouble() != area;
  final formatted =
      hasDecimals ? area.toStringAsFixed(2) : area.toStringAsFixed(0);
  return '$formatted m²';
}

String _formatCoefficientValue(double? value) {
  if (value == null) return '—';
  final hasDecimals = value.truncateToDouble() != value;
  return hasDecimals ? value.toStringAsFixed(3) : value.toStringAsFixed(0);
}

String _formatDateTime(DateTime? value) {
  if (value == null) return '—';
  final formatter = DateFormat('d MMM y · h:mm a', 'es');
  return formatter.format(value);
}

String _beautifyKey(String key) {
  return key
      .replaceAll('_', ' ')
      .split(' ')
      .map((word) => word.isEmpty
          ? word
          : '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}')
      .join(' ');
}

String _formatExtraValue(dynamic value) {
  if (value is bool) {
    return value ? 'Sí' : 'No';
  }
  if (value is num) {
    final hasDecimals = value is double && value.truncateToDouble() != value;
    return hasDecimals ? value.toStringAsFixed(2) : value.toString();
  }
  return value.toString();
}
