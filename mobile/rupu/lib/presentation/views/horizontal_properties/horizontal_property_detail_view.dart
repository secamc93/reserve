// presentation/views/horizontal_property/detail/horizontal_property_detail_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';

import 'horizontal_property_detail_controller.dart';

class HorizontalPropertyDetailView
    extends GetView<HorizontalPropertyDetailController> {
  static const name = 'horizontal-property-detail';
  final int propertyId;

  HorizontalPropertyDetailView({super.key, required this.propertyId});

  @override
  String? get tag => HorizontalPropertyDetailController.tagFor(propertyId);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(110),
          child: _PremiumAppBar(
            tag: tag!,
            tabs: const [
              (Icons.home_outlined, 'Dashboard'),
              (Icons.apartment_outlined, 'Unidades'),
              (Icons.group_outlined, 'Residentes'),
              (Icons.how_to_vote_outlined, 'Votaciones'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _DashboardTab(controllerTag: tag!),
            _UnitsTab(controllerTag: tag!),
            _ResidentsTab(controllerTag: tag!),
            const _PlaceholderTab(message: 'Votaciones'),
          ],
        ),
      ),
    );
  }
}

class _PremiumAppBar extends GetWidget<HorizontalPropertyDetailController> {
  final String tag;
  final List<(IconData, String)> tabs;
  const _PremiumAppBar({required this.tag, required this.tabs});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return AppBar(
      // 🔧 Hace visible el ícono de volver con el schema
      iconTheme: IconThemeData(color: cs.primary), // <-- back & leading
      actionsIconTheme: IconThemeData(color: cs.primary), // <-- actions
      foregroundColor: cs.onSurface, // <-- color base de texto en AppBar
      backgroundColor: cs.surface,
      elevation: 0,
      scrolledUnderElevation: 2,
      surfaceTintColor: Colors.transparent, // evita tinte extraño en M3
      centerTitle: false,
      titleSpacing: 16,

      // Gradiente sutil de fondo
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              cs.primary.withValues(alpha: .10),
              cs.secondary.withValues(alpha: .08),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),

      // Título consistente
      title: Obx(() {
        final name = controller.propertyName.trim().isEmpty
            ? 'Propiedad'
            : controller.propertyName;
        return Text(
          name,
          style: tt.titleLarge!.copyWith(
            fontWeight: FontWeight.normal,
            color: cs.onSurface, // asegura contraste del título
          ),
        );
      }),

      // TabBar elegante (pill)
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(54),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: _PillTabBar(items: tabs),
        ),
      ),
    );
  }
}

class _PillTabBar extends StatelessWidget {
  final List<(IconData, String)> items;
  const _PillTabBar({required this.items});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tabs = items.map((t) => Tab(icon: Icon(t.$1), text: t.$2)).toList();

    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: cs.surfaceContainerHigh, // <-- más contraste que surface
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: TabBar(
        isScrollable: true,
        dividerColor: Colors.transparent,
        indicatorSize: TabBarIndicatorSize.label,
        labelPadding: const EdgeInsets.symmetric(horizontal: 6),
        labelStyle: Theme.of(
          context,
        ).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800),
        unselectedLabelStyle: Theme.of(
          context,
        ).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
        labelColor: cs.onPrimaryContainer,
        unselectedLabelColor: cs.onSurfaceVariant,
        indicator: ShapeDecoration(
          color: cs.primaryContainer,
          shape: StadiumBorder(
            side: BorderSide(color: cs.primary.withValues(alpha: .25)),
          ),
        ),
        tabs: tabs,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
class _DashboardTab extends GetWidget<HorizontalPropertyDetailController> {
  final String controllerTag;
  const _DashboardTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final detail = controller.detail.value;
      final error = controller.errorMessage.value;

      if (isLoading && detail == null) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.loadAll,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
          children: [
            if (error != null) _InlineError(message: error),

            if (detail == null) ...[
              const SizedBox(height: 36),
              _EmptyState(
                icon: Icons.apartment_outlined,
                title: 'No se encontró información de la propiedad.',
                subtitle: 'Intenta actualizar o vuelve más tarde.',
              ),
            ] else ...[
              if (isLoading) const LinearProgressIndicator(minHeight: 2),
              const SizedBox(height: 12),

              // KPIs responsivos
              _MetricsGrid(
                items: [
                  MetricItem(
                    icon: Icons.apartment_outlined,
                    title: 'Unidades',
                    value: (controller.unitsTotal ?? 0).toDouble(),
                    accent: cs.primary,
                  ),
                  MetricItem(
                    icon: Icons.group_outlined,
                    title: 'Residentes',
                    value: (controller.residentsTotal ?? 0).toDouble(),
                    accent: cs.secondary,
                  ),
                  MetricItem(
                    icon: Icons.how_to_vote_outlined,
                    title: 'Grupos votación',
                    // si solo tienes 1er id, lo mostramos como número
                    value: controller.firstVotingGroupId?.toDouble() ?? 0,
                    suffix: controller.firstVotingGroupId == null ? '--' : null,
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

              // Información general
              _SectionCard(
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

class _UnitsTab extends GetWidget<HorizontalPropertyDetailController> {
  final String controllerTag;
  const _UnitsTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final unitsPage = controller.unitsPage.value;
      final isLoading = controller.unitsLoading.value;
      final error = controller.unitsErrorMessage.value;
      final units = unitsPage?.units ?? const <HorizontalPropertyUnitItem>[];
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
            onRefresh: controller.loadUnits,
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
                        controller.loadUnits();
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
                else
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
              ],
            ),
          );
        },
      );
    });
  }
}

class _ResidentsTab extends GetWidget<HorizontalPropertyDetailController> {
  final String controllerTag;
  const _ResidentsTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final residentsPage = controller.residentsPage.value;
      final isLoading = controller.residentsLoading.value;
      final error = controller.residentsErrorMessage.value;
      final residents =
          residentsPage?.residents ?? const <HorizontalPropertyResidentItem>[];
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
            onRefresh: controller.loadResidents,
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
                        controller.loadResidents();
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
                else
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
              ],
            ),
          );
        },
      );
    });
  }
}

class _UnitsFiltersContent
    extends GetWidget<HorizontalPropertyDetailController> {
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

class _ResidentsFiltersContent
    extends GetWidget<HorizontalPropertyDetailController> {
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

class _SummaryHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool showProgress;
  final VoidCallback onRefresh;

  const _SummaryHeader({
    required this.title,
    required this.subtitle,
    required this.showProgress,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
          ),
        ),
        if (showProgress)
          const SizedBox(
            width: 26,
            height: 26,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
        else
          IconButton(
            tooltip: 'Actualizar',
            onPressed: onRefresh,
            icon: const Icon(Icons.refresh_outlined),
          ),
      ],
    );
  }
}

class _FilterTextField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final double width;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  const _FilterTextField({
    required this.label,
    required this.controller,
    this.width = 200,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        textInputAction: textInputAction ?? TextInputAction.next,
        onSubmitted: onSubmitted,
        decoration: _filterDecoration(context, label),
      ),
    );
  }
}

InputDecoration _filterDecoration(BuildContext context, String label,
    {String? hint}) {
  final cs = Theme.of(context).colorScheme;
  return InputDecoration(
    labelText: label,
    hintText: hint,
    isDense: true,
    filled: true,
    fillColor: cs.surfaceContainerHighest,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: cs.outlineVariant),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: cs.primary),
    ),
  );
}

class _StatusChip extends StatelessWidget {
  final String label;
  final Color background;
  final Color foreground;

  const _StatusChip({
    required this.label,
    required this.background,
    required this.foreground,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: ShapeDecoration(
        color: background,
        shape: StadiumBorder(
          side: BorderSide(color: foreground.withValues(alpha: .25)),
        ),
      ),
      child: Text(
        label,
        style: tt.labelSmall?.copyWith(
          color: foreground,
          fontWeight: FontWeight.w900,
          letterSpacing: .3,
        ),
      ),
    );
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
                    value:
                        unit.block.isEmpty ? 'Sin bloque' : unit.block,
                  ),
                  _DetailLine(
                    icon: Icons.category_outlined,
                    label: 'Tipo de unidad',
                    value:
                        unit.unitType.isEmpty ? 'Sin tipo' : unit.unitType,
                  ),
                  _DetailLine(
                    icon: Icons.straighten_outlined,
                    label: 'Coeficiente',
                    value: _formatCoefficient(unit.participationCoefficient),
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class MetricItem {
  final IconData icon;
  final String title;
  final double value;
  final Color accent;
  final String? suffix;
  MetricItem({
    required this.icon,
    required this.title,
    required this.value,
    required this.accent,
    this.suffix,
  });
}

class _MetricsGrid extends StatelessWidget {
  const _MetricsGrid({required this.items});
  final List<MetricItem> items;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final crossAxis = width >= 1000
        ? 4
        : width >= 700
        ? 3
        : width >= 480
        ? 2
        : 1;

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: items.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxis,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 2.4,
      ),
      itemBuilder: (_, i) => _MetricCard(item: items[i]),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.item});
  final MetricItem item;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant),
        gradient: LinearGradient(
          colors: [item.accent.withValues(alpha: .14), cs.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: item.accent.withValues(alpha: .18),
                shape: BoxShape.circle,
                border: Border.all(color: item.accent.withValues(alpha: .25)),
              ),
              alignment: Alignment.center,
              child: Icon(item.icon, color: item.accent),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _AnimatedMetric(
                value: item.value,
                title: item.title,
                suffix: item.suffix,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AnimatedMetric extends StatelessWidget {
  const _AnimatedMetric({
    required this.value,
    required this.title,
    this.suffix,
  });
  final double value;
  final String title;
  final String? suffix;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 2),
        TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0, end: value),
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOutCubic,
          builder: (_, v, __) => Text(
            suffix ?? v.toStringAsFixed(0),
            style: tt.headlineSmall!.copyWith(
              fontWeight: FontWeight.w900,
              color: cs.onSurface,
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            child,
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: cs.primary.withValues(alpha: .08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: cs.primary.withValues(alpha: .18)),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: cs.primary),
          ),
          const SizedBox(width: 10),
          SizedBox(
            width: 170,
            child: Text(
              label,
              style: tt.bodyMedium!.copyWith(
                fontWeight: FontWeight.w800,
                color: cs.onSurface,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value.isEmpty ? '—' : value,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }
}

class _InlineError extends StatelessWidget {
  const _InlineError({required this.message});
  final String message;

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
              style: tt.bodyMedium!.copyWith(color: cs.onErrorContainer),
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
    final tt = Theme.of(context).textTheme;
    return Column(
      children: [
        Icon(icon, size: 56, color: cs.onSurfaceVariant),
        const SizedBox(height: 12),
        Text(
          title,
          style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
        ),
      ],
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  final String message;
  const _PlaceholderTab({required this.message});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Text(
        message,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
          color: cs.onSurfaceVariant,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
