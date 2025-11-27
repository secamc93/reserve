import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/presentation/views/horizontal_properties/widgets/vote_creation_sheet.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

import 'package:rupu/domain/entities/horizontal_property_voting.dart';
import 'package:rupu/presentation/views/horizontal_properties/controllers/horizontal_property_voting_controller.dart';
import 'package:rupu/presentation/views/horizontal_properties/controllers/voting_live_controller.dart';

class VotingLiveView extends GetView<VotingLiveController> {
  static const name = 'voting-live';

  final String controllerTag;
  final HorizontalPropertyVotingGroup group;
  final HorizontalPropertyVoting voting;

  VotingLiveView({
    super.key,
    required this.controllerTag,
    required this.group,
    required this.voting,
  });

  @override
  String? get tag => '$controllerTag-${group.id}-${voting.id}-live';

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final liveTag = tag!;

    // Ensure controller is registered
    if (!Get.isRegistered<VotingLiveController>(tag: liveTag)) {
      try {
        final parent = Get.find<HorizontalPropertyVotingController>(
          tag: controllerTag,
        );
        Get.put(
          VotingLiveController(
            parent: parent,
            groupId: group.id,
            votingId: voting.id,
          ),
          tag: liveTag,
        );
      } catch (e) {
        return Scaffold(
          appBar: AppBar(title: const Text('Error')),
          body: const Center(
            child: Text('No se pudo inicializar el controlador.'),
          ),
        );
      }
    }

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              voting.title,
              style: tt.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: cs.onPrimary,
              ),
            ),
            Text(
              group.name,
              style: tt.bodySmall?.copyWith(color: cs.onPrimary),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: cs.errorContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: cs.error,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'EN VIVO',
                  style: tt.labelSmall?.copyWith(
                    color: cs.onErrorContainer,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Obx(() {
        final isConnecting = controller.isConnecting.value;
        final filter = controller.filter.value;
        final units = controller.filteredUnits;

        if (controller.isPriming.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.errorMessage.value != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  controller.errorMessage.value!,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: controller.reconnect,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            ),
          );
        }

        return Column(
          children: [
            if (isConnecting) const LinearProgressIndicator(minHeight: 2),
            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Stats Cards Row
                          Row(
                            children: [
                              Expanded(
                                child: _StatCard(
                                  label: 'Total Votos',
                                  value: '${controller.totalVotesFromUnits}',
                                  icon: Icons.how_to_vote_outlined,
                                  color: cs.primaryContainer,
                                  onColor: cs.onPrimaryContainer,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _StatCard(
                                  label: 'Pendientes',
                                  value: '${controller.unitsPending}',
                                  icon: Icons.pending_actions_outlined,
                                  color: cs.tertiaryContainer,
                                  onColor: cs.onTertiaryContainer,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Chart Section
                          if (controller.options.isNotEmpty) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Resultados en tiempo real',
                                  style: tt.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                _ChartTypeSelector(controller: controller),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 300,
                              child: _buildChart(context, controller),
                            ),
                            const SizedBox(height: 24),
                          ],

                          // Search Bar
                          TextField(
                            controller: controller.searchCtrl,
                            focusNode: controller.searchFocus,
                            decoration: InputDecoration(
                              hintText: 'Buscar unidad o residente...',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: filter.isNotEmpty
                                  ? IconButton(
                                      onPressed: () {
                                        controller.searchCtrl.clear();
                                        controller.clearFilter();
                                      },
                                      icon: const Icon(Icons.clear),
                                    )
                                  : null,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              filled: true,
                              fillColor: cs.surfaceContainerHighest.withValues(
                                alpha: 0.5,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                            ),
                            onChanged: (value) {
                              controller.setFilter(value);
                              controller.searchUnits(value);
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Units Grid
                  if (units.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Text(
                            controller.liveUnits.isEmpty
                                ? 'No hay unidades registradas'
                                : 'No se encontraron resultados',
                            style: tt.bodyMedium?.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                      sliver: SliverGrid(
                        gridDelegate:
                            const SliverGridDelegateWithMaxCrossAxisExtent(
                              maxCrossAxisExtent: 160,
                              mainAxisSpacing: 12,
                              crossAxisSpacing: 12,
                              childAspectRatio: 1.4,
                            ),
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final unit = units[index];
                          return _UnitCard(
                            unit: unit,
                            isProcessing: controller.isProcessing(
                              unit.propertyUnitId,
                            ),
                            onTap: () => voting.isActive
                                ? _openVoteSheet(context, unit: unit)
                                : null,
                            onDelete: unit.hasVoted
                                ? () => _confirmDeleteVote(context, unit)
                                : null,
                          );
                        }, childCount: units.length),
                      ),
                    ),
                ],
              ),
            ),
          ],
        );
      }),
      floatingActionButton: voting.isActive
          ? FloatingActionButton.extended(
              onPressed: () => _openVoteSheet(context),
              icon: const Icon(Icons.add),
              label: const Text('Registrar Voto'),
            )
          : null,
    );
  }

  Widget _buildChart(BuildContext context, VotingLiveController controller) {
    final cs = Theme.of(context).colorScheme;

    final chartData = controller.options.map((option) {
      final count = controller.countForOption(option.id);
      final total = controller.totalVotesFromUnits;
      final percentage = total == 0 ? 0.0 : (count / total * 100);

      return _VotingChartData(
        optionText: option.optionText,
        votes: count,
        percentage: percentage,
        color: _parseColor(option.color) ?? cs.primary,
      );
    }).toList();

    chartData.sort((a, b) => b.votes.compareTo(a.votes));

    final type = controller.selectedChartType.value;

    switch (type) {
      case VotingChartType.doughnut:
        return SfCircularChart(
          legend: Legend(
            isVisible: true,
            position: LegendPosition.bottom,
            overflowMode: LegendItemOverflowMode.wrap,
            iconHeight: 10,
            iconWidth: 10,
          ),
          tooltipBehavior: TooltipBehavior(
            enable: true,
            format: 'point.x : point.y votos',
          ),
          series: <CircularSeries>[
            DoughnutSeries<_VotingChartData, String>(
              dataSource: chartData,
              xValueMapper: (data, _) => data.optionText,
              yValueMapper: (data, _) => data.votes,
              pointColorMapper: (data, _) => data.color,
              dataLabelMapper: (data, _) =>
                  '${data.percentage.toStringAsFixed(1)}%',
              dataLabelSettings: const DataLabelSettings(
                isVisible: true,
                labelPosition: ChartDataLabelPosition.outside,
                connectorLineSettings: ConnectorLineSettings(
                  type: ConnectorType.curve,
                  length: '10%',
                ),
                textStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
              enableTooltip: true,
              animationDuration: 1000,
              innerRadius: '60%',
              radius: '80%',
            ),
          ],
        );
      case VotingChartType.pie:
        return SfCircularChart(
          legend: Legend(
            isVisible: true,
            position: LegendPosition.bottom,
            overflowMode: LegendItemOverflowMode.wrap,
            iconHeight: 10,
            iconWidth: 10,
          ),
          tooltipBehavior: TooltipBehavior(
            enable: true,
            format: 'point.x : point.y votos',
          ),
          series: <CircularSeries>[
            PieSeries<_VotingChartData, String>(
              dataSource: chartData,
              xValueMapper: (data, _) => data.optionText,
              yValueMapper: (data, _) => data.votes,
              pointColorMapper: (data, _) => data.color,
              dataLabelMapper: (data, _) =>
                  '${data.percentage.toStringAsFixed(1)}%',
              dataLabelSettings: const DataLabelSettings(
                isVisible: true,
                labelPosition: ChartDataLabelPosition.outside,
                connectorLineSettings: ConnectorLineSettings(
                  type: ConnectorType.curve,
                  length: '10%',
                ),
                textStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
              enableTooltip: true,
              animationDuration: 1000,
              radius: '80%',
              explode: true,
              explodeIndex: 0,
            ),
          ],
        );
      case VotingChartType.bar:
        return SfCartesianChart(
          primaryXAxis: CategoryAxis(
            labelStyle: const TextStyle(fontSize: 10),
            majorGridLines: const MajorGridLines(width: 0),
          ),
          primaryYAxis: NumericAxis(isVisible: false, minimum: 0),
          plotAreaBorderWidth: 0,
          tooltipBehavior: TooltipBehavior(
            enable: true,
            header: '',
            format: 'point.y votos',
          ),
          series: <CartesianSeries>[
            BarSeries<_VotingChartData, String>(
              dataSource: chartData,
              xValueMapper: (data, _) => data.optionText,
              yValueMapper: (data, _) => data.votes,
              pointColorMapper: (data, _) => data.color,
              dataLabelSettings: const DataLabelSettings(
                isVisible: true,
                labelAlignment: ChartDataLabelAlignment.outer,
                textStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
              enableTooltip: true,
              animationDuration: 1000,
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(4),
                bottomRight: Radius.circular(4),
              ),
            ),
          ],
        );
      case VotingChartType.column:
        return SfCartesianChart(
          primaryXAxis: CategoryAxis(
            labelStyle: const TextStyle(fontSize: 10),
            majorGridLines: const MajorGridLines(width: 0),
            labelRotation: 45,
          ),
          primaryYAxis: NumericAxis(isVisible: false, minimum: 0),
          plotAreaBorderWidth: 0,
          tooltipBehavior: TooltipBehavior(
            enable: true,
            header: '',
            format: 'point.y votos',
          ),
          series: <CartesianSeries>[
            ColumnSeries<_VotingChartData, String>(
              dataSource: chartData,
              xValueMapper: (data, _) => data.optionText,
              yValueMapper: (data, _) => data.votes,
              pointColorMapper: (data, _) => data.color,
              dataLabelSettings: const DataLabelSettings(
                isVisible: true,
                labelAlignment: ChartDataLabelAlignment.outer,
                textStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
              enableTooltip: true,
              animationDuration: 1000,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
          ],
        );
      case VotingChartType.radialBar:
        return SfCircularChart(
          legend: Legend(
            isVisible: true,
            position: LegendPosition.bottom,
            overflowMode: LegendItemOverflowMode.wrap,
            iconHeight: 10,
            iconWidth: 10,
          ),
          tooltipBehavior: TooltipBehavior(
            enable: true,
            format: 'point.x : point.y votos',
          ),
          series: <CircularSeries>[
            RadialBarSeries<_VotingChartData, String>(
              dataSource: chartData,
              xValueMapper: (data, _) => data.optionText,
              yValueMapper: (data, _) => data.votes,
              pointColorMapper: (data, _) => data.color,
              dataLabelMapper: (data, _) => data.optionText,
              enableTooltip: true,
              animationDuration: 1000,
              maximumValue: controller.totalVotesFromUnits.toDouble(),
              cornerStyle: CornerStyle.bothCurve,
              innerRadius: '20%',
              radius: '100%',
              gap: '5%',
            ),
          ],
        );
    }
  }

  Color? _parseColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return null;
    }
  }

  // ... (existing imports)

  Future<void> _openVoteSheet(
    BuildContext context, {
    HorizontalPropertyVotingLiveUnit? unit,
  }) async {
    final success = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          VoteCreationSheet(controller: controller, unit: unit),
    );

    if (success == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Voto registrado correctamente')),
      );
    }
  }

  Future<void> _confirmDeleteVote(
    BuildContext context,
    HorizontalPropertyVotingLiveUnit unit,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Eliminar voto'),
        content: Text(
          '¿Quieres eliminar el voto registrado para ${unit.unitNumber}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final result = await controller.removeVote(
      propertyUnitId: unit.propertyUnitId,
    );

    if (!context.mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.message ??
              (result.success ? 'Voto eliminado' : 'Error al eliminar'),
        ),
        backgroundColor: result.success
            ? null
            : Theme.of(context).colorScheme.error,
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final Color onColor;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.onColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: onColor, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: onColor,
            ),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: onColor.withValues(alpha: 0.8),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _UnitCard extends StatelessWidget {
  final HorizontalPropertyVotingLiveUnit unit;
  final bool isProcessing;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const _UnitCard({
    required this.unit,
    required this.isProcessing,
    this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final hasVoted = unit.hasVoted;
    final color = hasVoted
        ? (unit.optionColor != null
              ? _parseColor(unit.optionColor) ?? cs.primary
              : cs.primary)
        : cs.surfaceContainerHighest;

    final onColor = hasVoted ? Colors.white : cs.onSurface;

    return Material(
      color: hasVoted ? color : cs.surface,
      elevation: hasVoted ? 2 : 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: hasVoted ? Colors.transparent : cs.outlineVariant,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    unit.unitNumber,
                    style: tt.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: onColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (unit.residentName != null)
                    Text(
                      unit.residentName!,
                      style: tt.bodySmall?.copyWith(
                        color: onColor.withValues(alpha: 0.8),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (hasVoted) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        unit.optionText ?? 'Votado',
                        style: tt.labelSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (isProcessing)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black12,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                ),
              ),
            if (hasVoted && onDelete != null && !isProcessing)
              Positioned(
                top: 0,
                right: 0,
                child: IconButton(
                  icon: const Icon(Icons.close, size: 16),
                  color: Colors.white,
                  onPressed: onDelete,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color? _parseColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return null;
    }
  }
}

class _VotingChartData {
  final String optionText;
  final int votes;
  final double percentage;
  final Color color;

  _VotingChartData({
    required this.optionText,
    required this.votes,
    required this.percentage,
    required this.color,
  });
}

class _ChartTypeSelector extends StatelessWidget {
  final VotingLiveController controller;

  const _ChartTypeSelector({required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return PopupMenuButton<VotingChartType>(
      initialValue: controller.selectedChartType.value,
      onSelected: (type) => controller.selectedChartType.value = type,
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: VotingChartType.doughnut,
          child: Row(
            children: [
              Icon(Icons.donut_large, size: 20),
              SizedBox(width: 8),
              Text('Dona'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: VotingChartType.pie,
          child: Row(
            children: [
              Icon(Icons.pie_chart, size: 20),
              SizedBox(width: 8),
              Text('Pastel'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: VotingChartType.bar,
          child: Row(
            children: [
              Icon(Icons.bar_chart, size: 20),
              SizedBox(width: 8),
              Text('Barras'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: VotingChartType.column,
          child: Row(
            children: [
              Icon(Icons.leaderboard, size: 20),
              SizedBox(width: 8),
              Text('Columnas'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: VotingChartType.radialBar,
          child: Row(
            children: [
              Icon(Icons.data_usage, size: 20),
              SizedBox(width: 8),
              Text('Radial'),
            ],
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(Icons.bar_chart, size: 18, color: cs.primary),
            const SizedBox(width: 6),
            Text(
              'Cambiar',
              style: TextStyle(
                color: cs.primary,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
