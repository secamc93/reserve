part of 'horizontal_property_detail_view.dart';

class _ResidentsTab extends GetWidget<HorizontalPropertyResidentsController> {
  final String controllerTag;
  const _ResidentsTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final residentsPage = controller.residentsPage.value;
      final isLoading = controller.residentsLoading.value;
      final isLoadingMore = controller.residentsLoadingMore.value;
      final error = controller.residentsErrorMessage.value;
      final residents =
          List<HorizontalPropertyResidentItem>.of(controller.residentsItems);
      final total = residentsPage?.total ?? 0;
      final page = residentsPage?.page ?? 1;
      final totalPages = residentsPage?.totalPages ?? 1;

      return LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final crossAxis = width >= 1200
              ? 3
              : width >= 840
                  ? 2
                  : 1;
          final aspect = crossAxis == 1 ? 1.25 : 1.1;

          return RefreshIndicator(
            onRefresh: controller.refresh,
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is ScrollUpdateNotification &&
                    notification.metrics.pixels >=
                        notification.metrics.maxScrollExtent - 200 &&
                    !isLoading &&
                    !isLoadingMore &&
                    residents.isNotEmpty &&
                    controller.canLoadMoreResidents) {
                  controller.loadMoreResidents();
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
                        title: 'Filtros de residentes',
                        child: _ResidentsFiltersContent(
                          controllerTag: controllerTag,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    sliver: SliverToBoxAdapter(
                      child: _SummaryHeader(
                        title: 'Residentes encontrados: $total',
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
                  if (!isLoading && residents.isEmpty)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: _EmptyState(
                        icon: Icons.group_outlined,
                        title: 'No se encontraron residentes.',
                        subtitle:
                            'Modifica los filtros o actualiza para intentarlo nuevamente.',
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
                          (context, index) =>
                              _ResidentCard(resident: residents[index]),
                          childCount: residents.length,
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
                              : (!controller.canLoadMoreResidents &&
                                      residents.isNotEmpty
                                  ? const Text(
                                      'No hay más residentes para cargar.',
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

class _ResidentsFiltersContent
    extends GetWidget<HorizontalPropertyResidentsController> {
  final String controllerTag;
  const _ResidentsFiltersContent({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _ResponsiveFormGrid(
          children: [
            _FilterTextField(
              label: 'Página',
              controller: controller.residentsPageCtrl,
              keyboardType: TextInputType.number,
            ),
            _FilterTextField(
              label: 'Tamaño de página',
              controller: controller.residentsPageSizeCtrl,
              keyboardType: TextInputType.number,
            ),
            _FilterTextField(
              label: 'Nombre',
              controller: controller.residentsNameCtrl,
            ),
            _FilterTextField(
              label: 'Correo',
              controller: controller.residentsEmailCtrl,
              keyboardType: TextInputType.emailAddress,
            ),
            _FilterTextField(
              label: 'Teléfono',
              controller: controller.residentsPhoneCtrl,
              keyboardType: TextInputType.phone,
            ),
            _FilterTextField(
              label: 'Unidad',
              controller: controller.residentsUnitNumberCtrl,
            ),
            _FilterTextField(
              label: 'Tipo de residente',
              controller: controller.residentsTypeCtrl,
            ),
            _FilterTextField(
              label: 'Buscar',
              controller: controller.residentsSearchCtrl,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => controller.applyResidentsFilters(),
            ),
            Obx(
              () => DropdownButtonFormField<bool?>(
                value: controller.residentsIsMain.value,
                decoration:
                    _filterDecoration(context, 'Es residente principal'),
                items: const [
                  DropdownMenuItem<bool?>(
                    value: null,
                    child: Text('Todos'),
                  ),
                  DropdownMenuItem<bool?>(
                    value: true,
                    child: Text('Sí'),
                  ),
                  DropdownMenuItem<bool?>(
                    value: false,
                    child: Text('No'),
                  ),
                ],
                onChanged: (value) {
                  controller.residentsIsMain.value = value;
                },
              ),
            ),
            Obx(
              () => DropdownButtonFormField<bool?>(
                value: controller.residentsIsActive.value,
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
                  controller.residentsIsActive.value = value;
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
                        controller.clearResidentsFilters();
                        controller.applyResidentsFilters();
                      },
                    ),
                  ),
          );
        }),
        const SizedBox(height: 16),
        Obx(() {
          final busy = controller.residentsLoading.value ||
              controller.residentsLoadingMore.value;
          return _FilterActionsRow(
            onClear: () {
              controller.clearResidentsFilters();
              controller.applyResidentsFilters();
            },
            onApply: () => controller.applyResidentsFilters(),
            isBusy: busy,
          );
        }),
      ],
    );
  }

  List<_ActiveFilterChipData> _buildActiveFilters() {
    final filters = <_ActiveFilterChipData>[];
    final page = controller.residentsPageCtrl.text.trim();
    if (page.isNotEmpty && page != '1') {
      filters.add(
        _ActiveFilterChipData(
          label: 'Página $page',
          onRemove: () {
            controller.residentsPageCtrl.text = '1';
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final pageSize = controller.residentsPageSizeCtrl.text.trim();
    if (pageSize.isNotEmpty && pageSize != '12') {
      filters.add(
        _ActiveFilterChipData(
          label: 'Tamaño $pageSize',
          onRemove: () {
            controller.residentsPageSizeCtrl.text = '12';
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final name = controller.residentsNameCtrl.text.trim();
    if (name.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Nombre "$name"',
          onRemove: () {
            controller.residentsNameCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final email = controller.residentsEmailCtrl.text.trim();
    if (email.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Correo $email',
          onRemove: () {
            controller.residentsEmailCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final phone = controller.residentsPhoneCtrl.text.trim();
    if (phone.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Teléfono $phone',
          onRemove: () {
            controller.residentsPhoneCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final unit = controller.residentsUnitNumberCtrl.text.trim();
    if (unit.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Unidad $unit',
          onRemove: () {
            controller.residentsUnitNumberCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final type = controller.residentsTypeCtrl.text.trim();
    if (type.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Tipo $type',
          onRemove: () {
            controller.residentsTypeCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final search = controller.residentsSearchCtrl.text.trim();
    if (search.isNotEmpty) {
      filters.add(
        _ActiveFilterChipData(
          label: 'Busca "$search"',
          onRemove: () {
            controller.residentsSearchCtrl.clear();
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final isMain = controller.residentsIsMain.value;
    if (isMain != null) {
      filters.add(
        _ActiveFilterChipData(
          label: isMain ? 'Casa principal' : 'No principal',
          onRemove: () {
            controller.residentsIsMain.value = null;
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    final status = controller.residentsIsActive.value;
    if (status != null) {
      filters.add(
        _ActiveFilterChipData(
          label: status ? 'Activos' : 'Inactivos',
          onRemove: () {
            controller.residentsIsActive.value = null;
            controller.applyResidentsFilters();
          },
        ),
      );
    }
    return filters;
  }
}

class _ResidentCard extends StatelessWidget {
  final HorizontalPropertyResidentItem resident;
  const _ResidentCard({required this.resident});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final (bgChip, fgChip, labelChip) = resident.isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVO')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVO');

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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: cs.primary.withValues(alpha: .15),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.person_outline, color: cs.primary),
                    ),
                    const Spacer(),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _StatusChip(
                          label: labelChip,
                          background: bgChip,
                          foreground: fgChip,
                        ),
                        if (resident.isMainResident)
                          _StatusChip(
                            label: 'PRINCIPAL',
                            background: cs.primaryContainer,
                            foreground: cs.onPrimaryContainer,
                          ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  resident.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  resident.residentTypeName.isEmpty
                      ? 'Sin tipo definido'
                      : resident.residentTypeName,
                  style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
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
                    icon: Icons.meeting_room_outlined,
                    label: 'Unidad',
                    value: resident.propertyUnitNumber.isEmpty
                        ? 'Sin unidad asignada'
                        : '#${resident.propertyUnitNumber}',
                  ),
                  _DetailLine(
                    icon: Icons.alternate_email_outlined,
                    label: 'Correo',
                    value: resident.email.isEmpty
                        ? 'Sin correo'
                        : resident.email,
                  ),
                  _DetailLine(
                    icon: Icons.phone_outlined,
                    label: 'Teléfono',
                    value: resident.phone.isEmpty
                        ? 'Sin teléfono'
                        : resident.phone,
                  ),
                  const SizedBox(height: 8),
                  _MainResidenceIndicator(isMain: resident.isMainResident),
                  const Spacer(),
                  _CardActions(
                    onEdit: () => _showActionFeedback(
                      'Editar residente',
                      'Funcionalidad disponible próximamente.',
                    ),
                    onDelete: () => _showActionFeedback(
                      'Eliminar residente',
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
}

class _MainResidenceIndicator extends StatelessWidget {
  final bool isMain;
  const _MainResidenceIndicator({required this.isMain});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    final valueStyle = tt.bodyMedium?.copyWith(
      fontWeight: FontWeight.w800,
      color: isMain ? Colors.green : cs.error,
    );
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(Icons.house_outlined, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: 8),
        Text(
          'Casa principal:',
          style: tt.bodyMedium?.copyWith(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(width: 4),
        Text(isMain ? 'Sí' : 'No', style: valueStyle),
      ],
    );
  }
}
