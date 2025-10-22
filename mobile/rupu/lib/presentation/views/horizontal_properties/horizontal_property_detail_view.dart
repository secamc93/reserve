// presentation/views/horizontal_property/detail/horizontal_property_detail_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
            const _PlaceholderTab(message: 'Unidades'),
            const _PlaceholderTab(message: 'Residentes'),
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
            fontWeight: FontWeight.w800,
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
