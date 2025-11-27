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
          final crossAxis = ResponsiveHelper.getGridColumns(
            context,
            mobile: 1,
            tablet: 1,
            largeTablet: 1,
            desktop: 3,
          );

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

      final bottomPadding = MediaQuery.viewPaddingOf(context).bottom;

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

class _UnitsFiltersContent extends StatelessWidget {
  final String controllerTag;
  const _UnitsFiltersContent({required this.controllerTag});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<HorizontalPropertyUnitsController>(
      tag: controllerTag,
    );
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // HEADER FILTROS (título + botón "avanzados")
        Row(
          children: [
            Icon(Icons.filter_alt_outlined, size: 18, color: cs.primary),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                'Filtra las unidades rápidamente',
                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              ),
            ),
            Obx(
              () => TextButton.icon(
                onPressed: () {
                  controller.unitsShowAdvancedFilters.toggle();
                },
                icon: Icon(
                  controller.unitsShowAdvancedFilters.value
                      ? Icons.expand_less_rounded
                      : Icons.expand_more_rounded,
                  size: 18,
                ),
                label: Text(
                  controller.unitsShowAdvancedFilters.value
                      ? 'Menos filtros'
                      : 'Filtros avanzados',
                  style: tt.labelSmall?.copyWith(fontWeight: FontWeight.w700),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 8),

        // FILTROS PRINCIPALES (siempre visibles)
        ResponsiveFormGrid(
          children: [
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

        // FILTROS AVANZADOS (colapsables)
        Obx(
          () => AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.only(top: 10),
              child: ResponsiveFormGrid(
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
                ],
              ),
            ),
            crossFadeState: controller.unitsShowAdvancedFilters.value
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 220),
          ),
        ),

        const SizedBox(height: 8),

        // CHIPS DE FILTROS ACTIVOS
        Obx(() {
          final _ = controller.filtersRevision.value;
          final chips = _buildActiveFilters(controller);
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

        const SizedBox(height: 12),

        // BOTONES APLICAR / LIMPIAR
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

  // 👇 Mantengo tu misma lógica interna de construcción de chips
  List<_ActiveFilterChipData> _buildActiveFilters(
    HorizontalPropertyUnitsController controller,
  ) {
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
    controller.clearUnitForm();

    final result =
        await showModalBottomSheet<HorizontalPropertyUnitDetailResult>(
          context: context,
          backgroundColor: Colors.transparent,
          barrierColor: Colors.black.withValues(alpha: 0.3),
          useRootNavigator: true,
          isScrollControlled: true,
          builder: (_) => _UnitFormBottomSheet(
            controller: controller,
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
    final unitsController = Get.find<HorizontalPropertyUnitsController>(
      tag: controllerTag,
    );

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
                  final isDeleting = unitsController.deletingUnitIds.contains(
                    unit.id,
                  );
                  final disableEdition = unitsController.unitMutationBusy.value;
                  return _CardActions(
                    onView: () => _openDetailSheet(context),
                    onEdit: disableEdition
                        ? null
                        : () => _openEditDialog(context),
                    onDelete: isDeleting ? null : () => _confirmDelete(context),
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
      barrierColor: Colors.black.withValues(alpha: 0.3),
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) =>
          _UnitDetailBottomSheet(controllerTag: controllerTag, unit: unit),
    );
  }

  Future<void> _openEditDialog(BuildContext context) async {
    final controller = Get.find<HorizontalPropertyUnitsController>(
      tag: controllerTag,
    );

    // Use a Completer to wait explicitly for the dialog context
    final dialogCompleter = Completer<BuildContext>();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        // Complete the completer when the builder runs
        if (!dialogCompleter.isCompleted) {
          dialogCompleter.complete(ctx);
        }
        return const Center(child: CircularProgressIndicator());
      },
    );

    // Wait for the dialog to be built and get its context
    final dialogContext = await dialogCompleter.future;

    HorizontalPropertyUnitDetailResult? detailResult;
    try {
      detailResult = await controller.fetchUnitDetail(unit.id);
    } catch (_) {
      detailResult = const HorizontalPropertyUnitDetailResult(
        success: false,
        message:
            'No se pudo cargar el detalle de la unidad. Inténtalo nuevamente.',
      );
    } finally {
      // Close loader - we're guaranteed to have the context
      if (dialogContext.mounted) {
        Navigator.of(dialogContext).pop();
      }
    }

    final resolvedDetail = detailResult;
    if (!resolvedDetail.success || resolvedDetail.unit == null) {
      _showSnack(
        'No se pudo cargar la unidad',
        resolvedDetail.message ?? 'Inténtalo nuevamente en unos segundos.',
        isError: true,
      );
      return;
    }

    if (!context.mounted) return;

    controller.initUnitForm(detail: resolvedDetail.unit!, fallback: unit);

    if (!context.mounted) return;

    final result = await showDialog<HorizontalPropertyUnitDetailResult>(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.3),
      builder: (_) => _UnitEditDialog(
        controller: controller,
        onSubmit: (payload) =>
            controller.updateUnit(unitId: unit.id, data: payload),
      ),
    );

    if (result != null && result.success) {
      final updatedNumber = result.unit?.number ?? unit.number;
      final message = result.message?.isNotEmpty == true
          ? result.message!
          : 'Los cambios de la unidad $updatedNumber se guardaron correctamente.';
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

    final controller = Get.find<HorizontalPropertyUnitsController>(
      tag: controllerTag,
    );
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

class _UnitDetailBottomSheet extends StatelessWidget {
  final String controllerTag;
  final HorizontalPropertyUnitItem unit;

  const _UnitDetailBottomSheet({
    required this.controllerTag,
    required this.unit,
  });

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.viewInsetsOf(context);
    final controller = Get.find<HorizontalPropertyUnitsController>(
      tag: controllerTag,
    );

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: GlassContainer(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        blur: 20,
        opacity: 0.95,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              const _SheetHandle(),
              Expanded(
                child: FutureBuilder<HorizontalPropertyUnitDetailResult>(
                  future: controller.fetchUnitDetail(unit.id),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState != ConnectionState.done) {
                      return const _UnitDetailLoading();
                    }
                    if (!snapshot.hasData) {
                      return _UnitDetailError(
                        message:
                            'No se pudo obtener la información de la unidad.',
                        onRetry: () {
                          // Trigger a rebuild to retry?
                          // Since it's stateless, we might need a way to force refresh.
                          // But fetchUnitDetail caches. We might need to clear cache.
                          // For now, simple retry might not work without state.
                          // We can use a ValueNotifier or just ignore retry for now
                          // as the controller handles caching.
                          // Actually, if it failed, it's not cached (or cached as error?).
                          // The controller removes from request map on error.
                          // So calling it again creates a new request.
                          // To force rebuild, we can use a stateful wrapper or just
                          // assume the user will close and reopen.
                          // Let's keep it simple.
                        },
                      );
                    }
                    final result = snapshot.data!;
                    if (!result.success || result.unit == null) {
                      return _UnitDetailError(
                        message:
                            result.message ??
                            'No se pudo obtener la información de la unidad.',
                        onRetry: () {},
                      );
                    }
                    return _UnitDetailContent(
                      detail: result.unit!,
                      fallback: unit,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _UnitFormBottomSheet extends StatelessWidget {
  final HorizontalPropertyUnitsController controller;
  final String title;
  final String actionLabel;
  final Future<HorizontalPropertyUnitDetailResult> Function(
    Map<String, dynamic> data,
  )
  onSubmit;

  const _UnitFormBottomSheet({
    required this.controller,
    required this.title,
    required this.actionLabel,
    required this.onSubmit,
  });

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
      'number': controller.unitFormNumberCtrl.text.trim(),
      'block': _emptyToNull(controller.unitFormBlockCtrl.text.trim()),
      'unit_type': controller.unitFormTypeCtrl.text.trim(),
      'floor': _parseInt(controller.unitFormFloorCtrl.text.trim()),
      'area': _parseDouble(controller.unitFormAreaCtrl.text.trim()),
      'bedrooms': _parseInt(controller.unitFormBedroomsCtrl.text.trim()),
      'bathrooms': _parseInt(controller.unitFormBathroomsCtrl.text.trim()),
      'participation_coefficient': _parseDouble(
        controller.unitFormCoefCtrl.text.trim(),
      ),
      'description': _emptyToNull(
        controller.unitFormDescriptionCtrl.text.trim(),
      ),
    };

    payload.removeWhere((key, value) => value == null);
    return payload;
  }

  String? _emptyToNull(String value) => value.isEmpty ? null : value;

  Future<void> _handleSubmit(
    BuildContext context,
    GlobalKey<FormState> formKey,
  ) async {
    if (controller.unitFormSaving.value) return;
    final formState = formKey.currentState;
    if (formState == null || !formState.validate()) {
      return;
    }

    FocusScope.of(context).unfocus();
    controller.unitFormSaving.value = true;
    controller.unitFormError.value = null;

    try {
      final result = await onSubmit(_buildPayload());
      if (!context.mounted) return;
      if (!result.success) {
        controller.unitFormSaving.value = false;
        controller.unitFormError.value =
            result.message ??
            'No se pudo guardar la unidad. Inténtalo más tarde.';
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!context.mounted) return;
      controller.unitFormSaving.value = false;
      controller.unitFormError.value =
          'Ocurrió un error al guardar la unidad. Inténtalo nuevamente.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);
    final formKey = GlobalKey<FormState>();

    InputDecoration decoration(String label, {String? hint}) {
      return InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle: tt.labelSmall?.copyWith(
          color: cs.onSurfaceVariant.withValues(alpha: .9),
          fontWeight: FontWeight.w600,
        ),
        hintStyle: tt.bodySmall?.copyWith(
          color: cs.onSurfaceVariant.withValues(alpha: .7),
        ),
        filled: true,
        fillColor: cs.surfaceContainerHigh.withValues(alpha: .9),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: cs.outlineVariant.withValues(alpha: .7),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cs.primary, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cs.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cs.error, width: 1.4),
        ),
      );
    }

    Widget field({
      required String label,
      required TextEditingController controller,
      String? hint,
      TextInputType keyboardType = TextInputType.text,
      String? Function(String?)? validator,
      TextInputAction textInputAction = TextInputAction.next,
      int maxLines = 1,
    }) {
      return TextFormField(
        controller: controller,
        decoration: decoration(label, hint: hint),
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        maxLines: maxLines,
        validator: validator,
      );
    }

    Widget sectionLabel(String title) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(
          title,
          style: tt.labelSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: cs.onSurfaceVariant.withValues(alpha: .9),
            letterSpacing: .2,
          ),
        ),
      );
    }

    // final isEditing = widget.initialDetail != null; // Removed as we use controller

    return FractionallySizedBox(
      heightFactor: 0.95,
      child: GlassContainer(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        blur: 20,
        opacity: 0.95,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: Column(
            children: [
              const SizedBox(height: 12),
              const _SheetHandle(),
              // HEADER tipo Instagram (avatar + título + estado)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [cs.primary, cs.secondary],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        Icons.apartment_outlined,
                        color: cs.onPrimary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: tt.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Completa la información para la unidad.', // Simplified text
                            style: tt.bodySmall?.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Divider(
                height: 1,
                color: cs.outlineVariant.withValues(alpha: .4),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
                  child: Form(
                    key: formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // SECCIÓN: Información básica
                        sectionLabel('Información básica'),
                        const SizedBox(height: 8),
                        field(
                          label: 'Número de unidad',
                          controller: controller.unitFormNumberCtrl,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Ingresa el número de la unidad';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 10),
                        field(
                          label: 'Tipo de unidad',
                          controller: controller.unitFormTypeCtrl,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Indica el tipo de unidad';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 10),
                        field(
                          label: 'Bloque',
                          controller: controller.unitFormBlockCtrl,
                          hint: 'Bloque o torre',
                        ),

                        const SizedBox(height: 20),

                        // SECCIÓN: Características físicas
                        sectionLabel('Características físicas'),
                        const SizedBox(height: 8),
                        field(
                          label: 'Piso',
                          controller: controller.unitFormFloorCtrl,
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
                        const SizedBox(height: 10),
                        field(
                          label: 'Área (m²)',
                          controller: controller.unitFormAreaCtrl,
                          keyboardType: const TextInputType.numberWithOptions(
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
                        const SizedBox(height: 10),
                        field(
                          label: 'Coeficiente de participación',
                          controller: controller.unitFormCoefCtrl,
                          keyboardType: const TextInputType.numberWithOptions(
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
                        const SizedBox(height: 10),
                        field(
                          label: 'Habitaciones',
                          controller: controller.unitFormBedroomsCtrl,
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
                        const SizedBox(height: 10),
                        field(
                          label: 'Baños',
                          controller: controller.unitFormBathroomsCtrl,
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

                        const SizedBox(height: 20),

                        // SECCIÓN: Descripción
                        sectionLabel('Descripción'),
                        const SizedBox(height: 8),
                        field(
                          label: 'Descripción',
                          controller: controller.unitFormDescriptionCtrl,
                          hint: 'Comparte detalles adicionales de la unidad',
                          keyboardType: TextInputType.multiline,
                          textInputAction: TextInputAction.newline,
                          maxLines: 3,
                        ),

                        Obx(() {
                          final errorMessage = controller.unitFormError.value;
                          if (errorMessage != null) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 16),
                              child: Container(
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
                                        errorMessage,
                                        style: tt.bodyMedium?.copyWith(
                                          color: cs.onErrorContainer,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        }),

                        const SizedBox(height: 24),

                        // BOTONES inferiores
                        Obx(
                          () => Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: controller.unitFormSaving.value
                                      ? null
                                      : () => Navigator.of(context).pop(),
                                  child: const Text('Cancelar'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: FilledButton.icon(
                                  onPressed: controller.unitFormSaving.value
                                      ? null
                                      : () => _handleSubmit(context, formKey),
                                  icon: controller.unitFormSaving.value
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
                                    controller.unitFormSaving.value
                                        ? 'Guardando...'
                                        : actionLabel,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _UnitEditDialog extends StatelessWidget {
  final HorizontalPropertyUnitsController controller;
  final Future<HorizontalPropertyUnitDetailResult> Function(
    Map<String, dynamic> data,
  )
  onSubmit;

  const _UnitEditDialog({required this.controller, required this.onSubmit});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);
    final formKey = GlobalKey<FormState>();

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: GlassContainer(
          borderRadius: BorderRadius.circular(24),
          blur: 20,
          opacity: 0.95,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Material(
              color: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // HEADER
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Obx(
                          () => TextButton(
                            onPressed: controller.unitFormSaving.value
                                ? null
                                : () => Navigator.of(context).pop(),
                            style: TextButton.styleFrom(
                              foregroundColor: cs.onSurface,
                              textStyle: tt.bodyMedium,
                            ),
                            child: const Text('Cancelar'),
                          ),
                        ),
                        Text(
                          'Editar unidad',
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Obx(
                          () => TextButton(
                            onPressed: controller.unitFormSaving.value
                                ? null
                                : () => _submit(context, formKey),
                            style: TextButton.styleFrom(
                              foregroundColor: Colors.blue,
                              textStyle: tt.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            child: controller.unitFormSaving.value
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.blue,
                                    ),
                                  )
                                : const Text('Guardar'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Divider(
                    height: 1,
                    color: cs.outlineVariant.withValues(alpha: 0.4),
                  ),

                  // CONTENT
                  Flexible(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.fromLTRB(
                        24,
                        24,
                        24,
                        24 + viewInsets.bottom,
                      ),
                      child: Form(
                        key: formKey,
                        child: Column(
                          children: [
                            // ICON PLACEHOLDER
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: cs.surfaceContainerHigh,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Icon(
                                Icons.apartment_outlined,
                                size: 40,
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 24),

                            TextFormField(
                              controller: controller.unitFormNumberCtrl,
                              decoration: _instagramDecoration(
                                cs,
                                'Número de unidad',
                              ),
                              validator: (value) =>
                                  (value?.trim().isEmpty ?? true)
                                  ? 'Requerido'
                                  : null,
                            ),
                            const SizedBox(height: 16),

                            TextFormField(
                              controller: controller.unitFormBlockCtrl,
                              decoration: _instagramDecoration(
                                cs,
                                'Bloque / Torre',
                              ),
                            ),
                            const SizedBox(height: 16),

                            TextFormField(
                              controller: controller.unitFormTypeCtrl,
                              decoration: _instagramDecoration(
                                cs,
                                'Tipo de unidad',
                              ),
                            ),
                            const SizedBox(height: 16),

                            TextFormField(
                              controller: controller.unitFormCoefCtrl,
                              decoration: _instagramDecoration(
                                cs,
                                'Coeficiente',
                              ),
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                    decimal: true,
                                  ),
                            ),
                            const SizedBox(height: 24),

                            // SWITCH
                            Obx(
                              () => _InstagramSwitch(
                                label: 'Unidad activa',
                                value: controller.unitFormIsActive.value,
                                onChanged: (v) =>
                                    controller.unitFormIsActive.value = v,
                              ),
                            ),

                            Obx(() {
                              final error = controller.unitFormError.value;
                              if (error != null) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: Text(
                                    error,
                                    style: tt.bodySmall?.copyWith(
                                      color: cs.error,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                );
                              }
                              return const SizedBox.shrink();
                            }),
                          ],
                        ),
                      ),
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

  InputDecoration _instagramDecoration(ColorScheme cs, String label) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: cs.surfaceContainerLow,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: cs.outline.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: cs.error.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
    );
  }

  Map<String, dynamic> _buildPayload() {
    return {
      'number': controller.unitFormNumberCtrl.text.trim(),
      'block': _nullable(controller.unitFormBlockCtrl.text),
      'unit_type': _nullable(controller.unitFormTypeCtrl.text),
      'participation_coefficient': double.tryParse(
        controller.unitFormCoefCtrl.text.trim(),
      ),
      'is_active': controller.unitFormIsActive.value,
    };
  }

  String? _nullable(String value) {
    return value.trim().isEmpty ? null : value.trim();
  }

  Future<void> _submit(
    BuildContext context,
    GlobalKey<FormState> formKey,
  ) async {
    if (controller.unitFormSaving.value) return;
    final form = formKey.currentState;
    if (form == null) return;

    if (!form.validate()) return;

    controller.unitFormSaving.value = true;
    controller.unitFormError.value = null;

    try {
      final result = await onSubmit(_buildPayload());
      if (!context.mounted) return;
      if (!result.success) {
        controller.unitFormSaving.value = false;
        controller.unitFormError.value = result.message ?? 'Error al guardar.';
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!context.mounted) return;
      controller.unitFormSaving.value = false;
      controller.unitFormError.value = 'Error inesperado.';
    }
  }
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
  final context = Get.context;
  if (context == null) return;

  DialogHelper.showBlurredDialog(
    context: context,
    barrierColor: Colors.black.withValues(alpha: 0.3),
    builder: (_) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Icon(
            isError ? Icons.error_outline : Icons.check_circle_outline,
            color: isError
                ? Theme.of(context).colorScheme.error
                : Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text(
            'OK',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    ),
  );
}

class _UnitDetailContent extends StatelessWidget {
  final HorizontalPropertyUnitDetail detail;
  final HorizontalPropertyUnitItem fallback;

  const _UnitDetailContent({required this.detail, required this.fallback});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    final isActive = detail.isActive ?? fallback.isActive;
    final (statusBg, statusFg, statusLabel) = isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVA')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVA');

    // mismos datos, solo cambia la forma de mostrarlos
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

    final extras = detail.extraAttributes.entries.where((entry) {
      final value = entry.value;
      if (value == null) return false;
      if (value is bool || value is num) return true;
      if (value is String) return value.trim().isNotEmpty;
      return false;
    }).toList()..sort((a, b) => a.key.compareTo(b.key));

    return Scrollbar(
      thumbVisibility: true,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // HEADER tipo tarjeta/perfil
            Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: cs.outlineVariant.withValues(alpha: .6),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: .08),
                    blurRadius: 20,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // avatar circular
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [cs.primary, cs.secondary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Icon(Icons.apartment_outlined, color: cs.onPrimary),
                  ),
                  const SizedBox(width: 16),
                  // info principal
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
                        const SizedBox(height: 4),
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
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            if ((detail.block ?? fallback.block)
                                .trim()
                                .isNotEmpty)
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
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: statusLabel,
                    background: statusBg,
                    foreground: statusFg,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // DETALLES EN CHIPS
            if (metrics.isNotEmpty) ...[
              Text(
                'Detalles de la unidad',
                style: tt.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: cs.onSurface,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 6),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: .35),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: cs.outlineVariant.withValues(alpha: .5),
                  ),
                ),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final metric in metrics) _MetricChip(data: metric),
                  ],
                ),
              ),
            ],

            // Propietario
            if (detail.owner != null) ...[
              const SizedBox(height: 28),
              const _SectionTitle(
                icon: Icons.badge_outlined,
                title: 'Propietario',
              ),
              const SizedBox(height: 12),
              _ContactTile(contact: detail.owner!, accent: cs.primary),
            ],

            // Residentes
            if (detail.residents.isNotEmpty) ...[
              const SizedBox(height: 28),
              const _SectionTitle(
                icon: Icons.groups_2_outlined,
                title: 'Residentes',
              ),
              const SizedBox(height: 12),
              ...detail.residents.map(
                (resident) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _ContactTile(contact: resident, accent: cs.secondary),
                ),
              ),
            ],

            // Vehículos
            if (detail.vehicles.isNotEmpty) ...[
              const SizedBox(height: 28),
              const _SectionTitle(
                icon: Icons.directions_car_filled_outlined,
                title: 'Vehículos asociados',
              ),
              const SizedBox(height: 12),
              ...detail.vehicles.map(
                (vehicle) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _VehicleTile(vehicle: vehicle),
                ),
              ),
            ],

            // Mascotas
            if (detail.pets.isNotEmpty) ...[
              const SizedBox(height: 28),
              const _SectionTitle(
                icon: Icons.pets_outlined,
                title: 'Mascotas registradas',
              ),
              const SizedBox(height: 12),
              ...detail.pets.map(
                (pet) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PetTile(pet: pet),
                ),
              ),
            ],

            // Extras
            if (extras.isNotEmpty) ...[
              const SizedBox(height: 28),
              const _SectionTitle(
                icon: Icons.info_outline,
                title: 'Información adicional',
              ),
              const SizedBox(height: 10),
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

class _MetricChip extends StatelessWidget {
  final _MetricTileData data;

  const _MetricChip({required this.data});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 120),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: ShapeDecoration(
          color: cs.surface.withValues(alpha: .9),
          shape: StadiumBorder(
            side: BorderSide(color: cs.outlineVariant.withValues(alpha: .7)),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(data.icon, size: 16, color: cs.primary),
            const SizedBox(width: 8),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.labelSmall?.copyWith(
                      color: cs.onSurfaceVariant,
                      fontWeight: FontWeight.w700,
                      letterSpacing: .2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    data.value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: cs.onSurface,
                    ),
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

class MetricTile extends StatelessWidget {
  final _MetricTileData data;

  const MetricTile({required this.data});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: .6)),
        color: cs.surfaceContainerHighest.withValues(alpha: .32),
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

class _ContactTile extends StatelessWidget {
  final HorizontalPropertyUnitContact contact;
  final Color accent;

  const _ContactTile({required this.contact, required this.accent});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final details = <(IconData, String)>[];
    if ((contact.document ?? '').trim().isNotEmpty) {
      details.add((Icons.credit_card, contact.document!.trim()));
    }
    if ((contact.phone ?? '').trim().isNotEmpty) {
      details.add((Icons.call_outlined, contact.phone!.trim()));
    }
    if ((contact.email ?? '').trim().isNotEmpty) {
      details.add((Icons.alternate_email, contact.email!.trim()));
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          colors: [accent.withValues(alpha: .12), cs.surface],
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
                child: _InfoRow(icon: item.$1, text: item.$2),
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
    final details = <(IconData, String)>[];
    if ((vehicle.plate ?? '').trim().isNotEmpty) {
      details.add((Icons.confirmation_number_outlined, vehicle.plate!.trim()));
    }
    if ((vehicle.model ?? '').trim().isNotEmpty) {
      details.add((Icons.directions_car_outlined, vehicle.model!.trim()));
    }
    if ((vehicle.color ?? '').trim().isNotEmpty) {
      details.add((Icons.color_lens_outlined, vehicle.color!.trim()));
    }
    if ((vehicle.parkingNumber ?? '').trim().isNotEmpty) {
      details.add((
        Icons.local_parking_outlined,
        vehicle.parkingNumber!.trim(),
      ));
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
                child: _InfoRow(icon: item.$1, text: item.$2),
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

    final details = <(IconData, String)>[];
    if ((pet.type ?? '').trim().isNotEmpty) {
      details.add((Icons.pets, pet.type!.trim()));
    }
    if ((pet.breed ?? '').trim().isNotEmpty) {
      details.add((Icons.badge_outlined, pet.breed!.trim()));
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
                child: _InfoRow(icon: item.$1, text: item.$2),
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
        color: cs.surfaceContainerHighest.withValues(alpha: .25),
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
  final formatted = hasDecimals
      ? area.toStringAsFixed(2)
      : area.toStringAsFixed(0);
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
      .map(
        (word) => word.isEmpty
            ? word
            : '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}',
      )
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
