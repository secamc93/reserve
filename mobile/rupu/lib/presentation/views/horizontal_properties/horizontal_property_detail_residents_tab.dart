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
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _FilterTextField(
              label: 'Página',
              controller: controller.residentsPageCtrl,
              width: 120,
              keyboardType: TextInputType.number,
            ),
            _FilterTextField(
              label: 'Tamaño de página',
              controller: controller.residentsPageSizeCtrl,
              width: 160,
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
              () => SizedBox(
                width: 220,
                child: DropdownButtonFormField<bool?>(
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
            ),
            Obx(
              () => SizedBox(
                width: 200,
                child: DropdownButtonFormField<bool?>(
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
                  controller.clearResidentsFilters();
                  controller.applyResidentsFilters();
                },
                icon: const Icon(Icons.cleaning_services_outlined),
                label: const Text('Limpiar filtros'),
              ),
              FilledButton.icon(
                onPressed: controller.applyResidentsFilters,
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
