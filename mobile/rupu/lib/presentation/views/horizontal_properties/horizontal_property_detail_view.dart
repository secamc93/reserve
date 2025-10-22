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
    final controllerTag = HorizontalPropertyDetailController.tagFor(propertyId);
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Obx(() => Text(controller.propertyName)),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(
                icon: Icon(Icons.home_outlined),
                text: 'Dashboard',
              ),
              Tab(
                icon: Icon(Icons.apartment_outlined),
                text: 'Unidades',
              ),
              Tab(
                icon: Icon(Icons.group_outlined),
                text: 'Residentes',
              ),
              Tab(
                icon: Icon(Icons.how_to_vote_outlined),
                text: 'Votaciones',
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _DashboardTab(controllerTag: controllerTag),
            const _PlaceholderTab(message: 'Unidades'),
            const _PlaceholderTab(message: 'Residentes'),
            const _PlaceholderTab(message: 'Votaciones'),
          ],
        ),
      ),
    );
  }
}

class _DashboardTab extends GetWidget<HorizontalPropertyDetailController> {
  final String controllerTag;

  const _DashboardTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
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
          padding: const EdgeInsets.all(16),
          children: [
            if (error != null)
              Card(
                color: theme.colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: theme.colorScheme.onErrorContainer,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          error,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onErrorContainer,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (detail == null)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 48),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.apartment_outlined, size: 48),
                    SizedBox(height: 16),
                    Text('No se encontró información de la propiedad.'),
                  ],
                ),
              )
            else ...[
              if (isLoading)
                const LinearProgressIndicator(minHeight: 2),
              const SizedBox(height: 16),
              _SummaryCards(detailTag: controllerTag),
              const SizedBox(height: 24),
              _GeneralInformationCard(detailTag: controllerTag),
            ],
          ],
        ),
      );
    });
  }
}

class _SummaryCards extends GetWidget<HorizontalPropertyDetailController> {
  final String detailTag;

  const _SummaryCards({required this.detailTag});

  @override
  String? get tag => detailTag;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final unitsTotal = controller.unitsTotal;
    final residentsTotal = controller.residentsTotal;
    final votingGroupId = controller.firstVotingGroupId;

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: [
        _MetricCard(
          icon: Icons.apartment_outlined,
          title: 'Unidades',
          value: unitsTotal != null ? '$unitsTotal' : '--',
          theme: theme,
        ),
        _MetricCard(
          icon: Icons.group_outlined,
          title: 'Residentes',
          value: residentsTotal != null ? '$residentsTotal' : '--',
          theme: theme,
        ),
        _MetricCard(
          icon: Icons.how_to_vote_outlined,
          title: 'Grupos de votación',
          value: votingGroupId != null ? '#$votingGroupId' : '--',
          theme: theme,
        ),
        _MetricCard(
          icon: Icons.monetization_on_outlined,
          title: 'Cuotas',
          value: '--',
          theme: theme,
        ),
      ],
    );
  }
}

class _GeneralInformationCard extends GetWidget<HorizontalPropertyDetailController> {
  final String detailTag;

  const _GeneralInformationCard({required this.detailTag});

  @override
  String? get tag => detailTag;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final detail = controller.detail.value;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información general',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _InfoRow(
              label: 'Nombre',
              value: detail?.name ?? '--',
            ),
            _InfoRow(
              label: 'Total de unidades',
              value: detail?.totalUnits?.toString() ?? '--',
            ),
            _InfoRow(
              label: 'Dirección',
              value: detail?.address?.isNotEmpty == true
                  ? detail!.address!
                  : '--',
            ),
            _InfoRow(
              label: 'Tipo de negocio',
              value: detail?.businessTypeName ?? '--',
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final ThemeData theme;

  const _MetricCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 250,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(icon, size: 32, color: theme.colorScheme.primary),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      value,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 160,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.isNotEmpty ? value : '--',
              style: theme.textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  final String message;

  const _PlaceholderTab({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        message,
        style: Theme.of(context).textTheme.titleLarge,
      ),
    );
  }
}
