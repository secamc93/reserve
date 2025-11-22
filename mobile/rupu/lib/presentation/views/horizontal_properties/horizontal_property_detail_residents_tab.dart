part of 'horizontal_property_detail_view.dart';

// ─────────────────────────────────────────────────────────────
// PESTAÑA PRINCIPAL (RESIDENTS TAB)
// ─────────────────────────────────────────────────────────────

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
      final residents = List<HorizontalPropertyResidentItem>.of(
        controller.residentsItems,
      );
      final total = residentsPage?.total ?? 0;
      final page = residentsPage?.page ?? 1;
      final totalPages = residentsPage?.totalPages ?? 1;

      return LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final isTablet = width >= 720;
          final horizontalPadding = isTablet ? 24.0 : 16.0;

          final crossAxis = width >= 1200
              ? 3
              : width >= 840
                  ? 2
                  : 1;

          final listContent = RefreshIndicator(
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
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        16,
                        horizontalPadding,
                        8,
                      ),
                      child: _ResidentsHeaderSummary(
                        total: total,
                        page: page,
                        totalPages: totalPages,
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(
                      horizontalPadding,
                      8,
                      horizontalPadding,
                      12,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: SectionCard(
                        title: 'Filtros de residentes',
                        subtitle:
                            'Filtra rápidamente y abre los filtros avanzados solo cuando los necesites',
                        child: _ResidentsFiltersContent(
                          controllerTag: controllerTag,
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(
                      horizontalPadding,
                      0,
                      horizontalPadding,
                      12,
                    ),
                    sliver: SliverToBoxAdapter(
                      child: SummaryHeader(
                        title: 'Residentes encontrados: $total',
                        subtitle: 'Página $page de $totalPages',
                        showProgress: isLoading,
                        onRefresh: controller.refresh,
                      ),
                    ),
                  ),
                  if (error != null)
                    SliverPadding(
                      padding: EdgeInsets.symmetric(
                        horizontal: horizontalPadding,
                      ),
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
                      padding: EdgeInsets.fromLTRB(
                        horizontalPadding,
                        0,
                        horizontalPadding,
                        24,
                      ),
                      sliver: crossAxis == 1
                          ? SliverList.builder(
                              itemBuilder: (context, index) => Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: _ResidentCard(
                                  resident: residents[index],
                                  controllerTag: controllerTag,
                                ),
                              ),
                              itemCount: residents.length,
                            )
                          : SliverGrid(
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: crossAxis,
                                mainAxisSpacing: 16,
                                crossAxisSpacing: 16,
                                mainAxisExtent: 340,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (context, index) => _ResidentCard(
                                  resident: residents[index],
                                  controllerTag: controllerTag,
                                ),
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
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.6,
                                  ),
                                )
                              : (!controller.canLoadMoreResidents &&
                                      residents.isNotEmpty
                                  ? const Text(
                                      'Ya viste todos los residentes 👌',
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

          final bottomPadding = MediaQuery.viewPaddingOf(context).bottom;

          return Stack(
            children: [
              Positioned.fill(child: listContent),
              Positioned(
                right: 24,
                bottom: 24 + bottomPadding,
                child: _AddResidentFab(controllerTag: controllerTag),
              ),
            ],
          );
        },
      );
    });
  }
}

class _ResidentsHeaderSummary extends StatelessWidget {
  final int total;
  final int page;
  final int totalPages;

  const _ResidentsHeaderSummary({
    required this.total,
    required this.page,
    required this.totalPages,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(colors: [cs.primary, cs.secondary]),
          ),
          alignment: Alignment.center,
          child: Icon(Icons.group_outlined, color: cs.onPrimary, size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Residentes',
                style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 2),
              Text(
                '$total residentes · página $page de $totalPages',
                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AddResidentFab extends StatelessWidget {
  final String controllerTag;
  const _AddResidentFab({required this.controllerTag});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () => _openCreateDialog(context),
      icon: const Icon(Icons.person_add_alt_rounded),
      label: const Text('Agregar residente'),
    );
  }

  Future<void> _openCreateDialog(BuildContext context) async {
    final controller = Get.find<HorizontalPropertyResidentsController>(
      tag: controllerTag,
    );
    await controller.loadUnitsOptions();

    final result = await showDialog<HorizontalPropertyResidentDetailResult>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _ResidentFormDialog(
        controller: controller,
        title: 'Crear residente',
        actionLabel: 'Crear residente',
        onSubmit: (payload) => controller.createResident(data: payload),
      ),
    );

    if (result != null && result.success) {
      final message = result.message?.isNotEmpty == true
          ? result.message!
          : 'El residente se creó correctamente.';
      _showSnack('Residente creado', message);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// WIDGETS DE FILTROS MINIMALISTAS
// ─────────────────────────────────────────────────────────────

class ActiveFiltersBadge extends StatelessWidget {
  final int count;
  const ActiveFiltersBadge({required this.count});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: cs.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.primary.withValues(alpha: 0.3)),
      ),
      child: Text(
        '$count',
        style: TextStyle(
          color: cs.primary,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _ResidentsFiltersContent extends StatefulWidget {
  final String controllerTag;
  const _ResidentsFiltersContent({required this.controllerTag});

  @override
  State<_ResidentsFiltersContent> createState() =>
      _ResidentsFiltersContentState();
}

class _ResidentsFiltersContentState extends State<_ResidentsFiltersContent> {
  late final HorizontalPropertyResidentsController controller;
  bool _showAdvanced = false;

  @override
  void initState() {
    super.initState();
    controller = Get.find<HorizontalPropertyResidentsController>(
      tag: widget.controllerTag,
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // HEADER FILTROS
        Row(
          children: [
            Icon(Icons.filter_alt_outlined, size: 18, color: cs.primary),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                'Filtra los residentes rápidamente',
                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              ),
            ),
            TextButton.icon(
              onPressed: () {
                setState(() => _showAdvanced = !_showAdvanced);
              },
              icon: Icon(
                _showAdvanced
                    ? Icons.expand_less_rounded
                    : Icons.expand_more_rounded,
                size: 18,
              ),
              label: Text(
                _showAdvanced ? 'Menos filtros' : 'Filtros avanzados',
                style: tt.labelSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8),
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
              controller: controller.residentsSearchCtrl,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => controller.applyResidentsFilters(),
            ),
            FilterTextField(
              label: 'Nombre',
              controller: controller.residentsNameCtrl,
            ),
            Obx(
              () => DropdownButtonFormField<bool?>(
                initialValue: controller.residentsIsActive.value,
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
                  controller.residentsIsActive.value = value;
                },
              ),
            ),
            Obx(
              () => DropdownButtonFormField<bool?>(
                initialValue: controller.residentsIsMain.value,
                decoration: _filterDecoration(context, 'Residente principal'),
                items: const [
                  DropdownMenuItem<bool?>(value: null, child: Text('Todos')),
                  DropdownMenuItem<bool?>(value: true, child: Text('Sí')),
                  DropdownMenuItem<bool?>(value: false, child: Text('No')),
                ],
                onChanged: (value) {
                  controller.residentsIsMain.value = value;
                },
              ),
            ),
          ],
        ),

        // FILTROS AVANZADOS (colapsables)
        AnimatedCrossFade(
          firstChild: const SizedBox.shrink(),
          secondChild: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: ResponsiveFormGrid(
              children: [
                FilterTextField(
                  label: 'Página',
                  controller: controller.residentsPageCtrl,
                  keyboardType: TextInputType.number,
                ),
                FilterTextField(
                  label: 'Tamaño de página',
                  controller: controller.residentsPageSizeCtrl,
                  keyboardType: TextInputType.number,
                ),
                FilterTextField(
                  label: 'Correo',
                  controller: controller.residentsEmailCtrl,
                  keyboardType: TextInputType.emailAddress,
                ),
                FilterTextField(
                  label: 'Teléfono',
                  controller: controller.residentsPhoneCtrl,
                  keyboardType: TextInputType.phone,
                ),
                FilterTextField(
                  label: 'Unidad',
                  controller: controller.residentsUnitNumberCtrl,
                ),
                FilterTextField(
                  label: 'Tipo de residente',
                  controller: controller.residentsTypeCtrl,
                ),
              ],
            ),
          ),
          crossFadeState: _showAdvanced
              ? CrossFadeState.showSecond
              : CrossFadeState.showFirst,
          duration: const Duration(milliseconds: 220),
        ),

        const SizedBox(height: 8),

        // CHIPS de filtros activos
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

        const SizedBox(height: 12),

        // BOTONES APLICAR / LIMPIAR
        Obx(() {
          final busy =
              controller.residentsLoading.value ||
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

  // 👇 misma lógica que ya tenías, solo reusada
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

// ─────────────────────────────────────────────────────────────
// WIDGETS DE TARJETA RESIDENTE (ESTILO INSTAGRAM)
// ─────────────────────────────────────────────────────────────

class _ResidentCard extends StatelessWidget {
  final HorizontalPropertyResidentItem resident;
  final String controllerTag;
  const _ResidentCard({required this.resident, required this.controllerTag});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final (bgChip, fgChip, labelChip) = resident.isActive
        ? (
            cs.primaryContainer.withValues(alpha: 0.4),
            cs.onPrimaryContainer,
            'ACTIVO',
          )
        : (cs.error.withValues(alpha: 0.1), cs.error, 'INACTIVO');

    return Card(
      elevation: 0.5, // Sutil elevación para destacar
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: cs.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // HEADER (Avatar y Estado)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar/Icono del residente
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    Icons.person_outline,
                    color: cs.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                // Nombre y tipo
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        resident.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: tt.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: cs.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        resident.residentTypeName.isEmpty
                            ? 'Sin tipo definido'
                            : resident.residentTypeName,
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSurfaceVariant,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                // Chip de Estado
                _StatusChip(
                  label: labelChip,
                  background: bgChip,
                  foreground: fgChip,
                ),
              ],
            ),
            const SizedBox(height: 12),

            // DETALLES DE CONTACTO (Estilo Feed/Post)
            DetailLine(
              icon: Icons.meeting_room_outlined,
              label: 'Unidad',
              value: resident.propertyUnitNumber.isEmpty
                  ? 'Sin asignar'
                  : "#${resident.propertyUnitNumber}",
              isCompact: true,
            ),
            DetailLine(
              icon: Icons.alternate_email_outlined,
              label: 'Correo',
              value: resident.email.isEmpty ? 'Sin correo' : resident.email,
              isCompact: true,
            ),
            DetailLine(
              icon: Icons.phone_outlined,
              label: 'Teléfono',
              value: resident.phone.isEmpty ? 'Sin teléfono' : resident.phone,
              isCompact: true,
            ),

            // INDICADOR PRINCIPAL Y ACCIONES
            const SizedBox(height: 8),
            _MainResidenceIndicator(isMain: resident.isMainResident),
            const SizedBox(height: 12),
            _CardActions(
              viewLabel: 'Ver perfil',
              onView: () => _showActionFeedback(
                'Ver residente',
                'Funcionalidad disponible próximamente.',
              ),
              onEdit: () => _openEditDialog(context),
              onDelete: () => _showActionFeedback(
                'Eliminar residente',
                'Contacta al administrador para continuar con la acción.',
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openEditDialog(BuildContext context) async {
    final controller = Get.find<HorizontalPropertyResidentsController>(
      tag: controllerTag,
    );
    Get.dialog(
      const Center(child: CircularProgressIndicator()),
      barrierDismissible: false,
    );
    HorizontalPropertyResidentDetailResult? detail;
    try {
      detail = await controller.fetchResidentDetail(resident.id);
    } catch (_) {
      detail = const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo cargar la información del residente.',
      );
    } finally {
      if (Get.isDialogOpen ?? false) {
        Get.back();
      }
    }

    if (detail == null || !detail.success || detail.resident == null) {
      _showSnack(
        'No se pudo cargar',
        detail?.message ?? 'Inténtalo nuevamente en unos segundos.',
        isError: true,
      );
      return;
    }

    await controller.loadUnitsOptions();

    final result = await showDialog<HorizontalPropertyResidentDetailResult>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _ResidentFormDialog(
        controller: controller,
        title: 'Editar residente',
        actionLabel: 'Actualizar residente',
        initialDetail: detail!.resident,
        fallback: resident,
        showActiveSwitch: true,
        onSubmit: (payload) =>
            controller.updateResident(residentId: resident.id, data: payload),
      ),
    );

    if (result != null && result.success) {
      final message = result.message?.isNotEmpty == true
          ? result.message!
          : 'El residente ${resident.name} se actualizó correctamente.';
      _showSnack('Residente actualizado', message);
    }
  }
}

class _ResidentFormDialog extends StatefulWidget {
  final HorizontalPropertyResidentsController controller;
  final String title;
  final String actionLabel;
  final HorizontalPropertyResidentDetail? initialDetail;
  final HorizontalPropertyResidentItem? fallback;
  final bool showActiveSwitch;
  final Future<HorizontalPropertyResidentDetailResult> Function(
    Map<String, dynamic> data,
  )
      onSubmit;

  const _ResidentFormDialog({
    required this.controller,
    required this.title,
    required this.actionLabel,
    required this.onSubmit,
    this.initialDetail,
    this.fallback,
    this.showActiveSwitch = false,
  });

  @override
  State<_ResidentFormDialog> createState() => _ResidentFormDialogState();
}

class _ResidentFormDialogState extends State<_ResidentFormDialog> {
  static const _residentTypes = <int, String>{
    1: 'Propietario',
    2: 'Arrendatario',
    3: 'Familiar',
    4: 'Invitado',
  };

  final _formKey = GlobalKey<FormState>();
  final TextEditingController _unitCtrl = TextEditingController();
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _dniCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  final TextEditingController _emergencyCtrl = TextEditingController();
  int? _selectedUnitId;
  int? _residentTypeId;
  bool _isMain = true;
  bool _isActive = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final detail = widget.initialDetail;
    final fallback = widget.fallback;
    _selectedUnitId = detail?.propertyUnitId;
    _unitCtrl.text = detail?.propertyUnitNumber ?? fallback?.propertyUnitNumber ?? '';
    _residentTypeId = detail?.residentTypeId;
    _nameCtrl.text = detail?.name ?? fallback?.name ?? '';
    _emailCtrl.text = detail?.email ?? fallback?.email ?? '';
    _dniCtrl.text = detail?.dni ?? '';
    _phoneCtrl.text = detail?.phone ?? fallback?.phone ?? '';
    _emergencyCtrl.text = detail?.emergencyContact ?? '';
    _isMain = detail?.isMainResident ?? fallback?.isMainResident ?? true;
    _isActive = detail?.isActive ?? fallback?.isActive ?? true;
  }

  @override
  void dispose() {
    _unitCtrl.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _dniCtrl.dispose();
    _phoneCtrl.dispose();
    _emergencyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(widget.title),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 620),
        child: Padding(
          padding: EdgeInsets.only(bottom: viewInsets.bottom),
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _unitAutocomplete(),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: _residentTypeId,
                    decoration: _fieldDecoration('Tipo de residente'),
                    items: _residentTypes.entries
                        .map(
                          (entry) => DropdownMenuItem<int>(
                            value: entry.key,
                            child: Text(entry.value),
                          ),
                        )
                        .toList(),
                    onChanged: (value) => setState(() => _residentTypeId = value),
                    validator: (value) =>
                        value == null ? 'Selecciona el tipo de residente' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: _fieldDecoration('Nombre completo'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Ingresa el nombre del residente';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _emailCtrl,
                    decoration: _fieldDecoration('Email'),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _dniCtrl,
                    decoration: _fieldDecoration('Documento de identidad'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _phoneCtrl,
                    decoration: _fieldDecoration('Teléfono'),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _emergencyCtrl,
                    decoration: _fieldDecoration('Contacto de emergencia'),
                  ),
                  const SizedBox(height: 8),
                  CheckboxListTile(
                    value: _isMain,
                    onChanged: (value) => setState(() => _isMain = value ?? true),
                    title: const Text('Residente principal'),
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                  ),
                  if (widget.showActiveSwitch)
                    CheckboxListTile(
                      value: _isActive,
                      onChanged: (value) =>
                          setState(() => _isActive = value ?? true),
                      title: const Text('Activo'),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                    ),
                  if (_error != null) ...[
                    const SizedBox(height: 4),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        _error!,
                        style: tt.bodySmall?.copyWith(color: cs.error),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: _saving ? null : _submit,
          child: _saving
              ? SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    color: cs.onPrimary,
                    strokeWidth: 2,
                  ),
                )
              : Text(widget.actionLabel),
        ),
      ],
    );
  }

  InputDecoration _fieldDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  Widget _unitAutocomplete() {
    final options = widget.controller.unitsOptions;
    return Obx(() {
      final loading = widget.controller.unitsOptionsLoading.value;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Autocomplete<HorizontalPropertyUnitItem>(
            displayStringForOption: (option) => option.number,
            initialValue: TextEditingValue(text: _unitCtrl.text),
            optionsBuilder: (text) {
              return widget.controller.filterUnits(text.text);
            },
            onSelected: (option) {
              _selectedUnitId = option.id;
              _unitCtrl.text = option.number;
            },
            fieldViewBuilder: (
              context,
              textEditingController,
              focusNode,
              onFieldSubmitted,
            ) {
              textEditingController.text = _unitCtrl.text;
              _unitCtrl.value = textEditingController.value;
              return TextFormField(
                controller: textEditingController,
                focusNode: focusNode,
                decoration: _fieldDecoration('Unidad'),
                onFieldSubmitted: (_) => onFieldSubmitted(),
                validator: (value) {
                  if ((value ?? '').trim().isEmpty) {
                    return 'Selecciona la unidad';
                  }
                  if (_selectedUnitId == null &&
                      !_matchUnit(value ?? '', options)) {
                    return 'Selecciona una unidad válida';
                  }
                  return null;
                },
                onChanged: (_) => setState(() => _selectedUnitId = null),
              );
            },
          ),
          if (loading)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Row(
                children: const [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  SizedBox(width: 8),
                  Text('Cargando unidades...'),
                ],
              ),
            ),
        ],
      );
    });
  }

  bool _matchUnit(String input, List<HorizontalPropertyUnitItem> options) {
    final normalized = input.trim().toLowerCase();
    for (final unit in options) {
      if (unit.number.toLowerCase() == normalized) {
        _selectedUnitId = unit.id;
        return true;
      }
    }
    return false;
  }

  Map<String, dynamic> _buildPayload() {
    return {
      'property_unit_id': _selectedUnitId,
      'resident_type_id': _residentTypeId,
      'name': _nameCtrl.text.trim(),
      'email': _nullable(_emailCtrl.text),
      'dni': _nullable(_dniCtrl.text),
      'phone': _nullable(_phoneCtrl.text),
      'emergency_contact': _nullable(_emergencyCtrl.text),
      'is_main_resident': _isMain,
      if (widget.showActiveSwitch) 'is_active': _isActive,
    };
  }

  String? _nullable(String value) {
    return value.trim().isEmpty ? null : value.trim();
  }

  Future<void> _submit() async {
    if (_saving) return;
    final form = _formKey.currentState;
    if (form == null) return;

    if (_selectedUnitId == null) {
      _matchUnit(_unitCtrl.text, widget.controller.unitsOptions);
    }

    if (!form.validate() || _selectedUnitId == null) {
      setState(() {
        _error = _selectedUnitId == null ? 'Selecciona la unidad.' : null;
      });
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final result = await widget.onSubmit(_buildPayload());
      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _saving = false;
          _error = result.message ?? 'No se pudo completar la acción.';
        });
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = 'Ocurrió un error al procesar la solicitud.';
      });
    }
  }
}

class DetailLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isCompact;

  const DetailLine({
    required this.icon,
    required this.label,
    required this.value,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: isCompact ? 3.0 : 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 18,
            color: cs.onSurfaceVariant.withValues(alpha: 0.8),
          ),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: tt.bodySmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: cs.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: tt.bodySmall?.copyWith(
                color: cs.onSurface,
                fontWeight: FontWeight.w500,
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
    final valueStyle = tt.bodySmall?.copyWith(
      fontWeight: FontWeight.w800,
      color: isMain ? Colors.green.shade700 : cs.onSurfaceVariant,
    );
    final iconColor = isMain ? Colors.green.shade400 : cs.onSurfaceVariant;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(Icons.house_outlined, size: 18, color: iconColor),
        const SizedBox(width: 8),
        Text(
          'Residencia principal:',
          style: tt.bodySmall?.copyWith(
            color: cs.onSurfaceVariant,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(width: 4),
        Text(isMain ? 'Sí' : 'No', style: valueStyle),
      ],
    );
  }
}
