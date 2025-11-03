import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/attendance.dart';

import 'controllers/attendance_management_controller.dart';

class AttendanceManagementView extends GetView<AttendanceManagementController> {
  final int propertyId;
  final int votingGroupId;

  const AttendanceManagementView({
    super.key,
    required this.propertyId,
    required this.votingGroupId,
  });

  @override
  String? get tag => AttendanceManagementController.tagFor(
    propertyId: propertyId,
    votingGroupId: votingGroupId,
  );

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de asistencia'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Obx(() {
          final loading =
              controller.isLoadingLists.value && controller.lists.isEmpty;
          if (loading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: controller.fetchLists,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
              children: [
                _HeaderSection(
                  title: controller.groupName,
                  description: controller.groupDescription,
                ),
                const SizedBox(height: 16),
                if (controller.listsError.value != null) ...[
                  _InlineError(
                    message: controller.listsError.value!,
                    onRetry: () => controller.fetchLists(),
                  ),
                  const SizedBox(height: 16),
                ],
                Obx(() {
                  final list = controller.selectedList.value;
                  if (list == null) {
                    return _EmptyState(
                      icon: Icons.list_alt_outlined,
                      title: 'Sin listas de asistencia',
                      description:
                          'Aún no se han generado listas para este grupo de votación.',
                    );
                  }
                  return _AttendanceListCard(
                    controller: controller,
                    list: list,
                    onOpenRecords: () => _openRecordsSheet(context),
                    onOpenSummary: () => _openSummarySheet(context),
                    onCreateList: () => _showComingSoon(
                      context,
                      'Crear lista',
                      'Muy pronto podrás crear listas manuales desde esta vista.',
                    ),
                    onGenerateAutomatic: () => _showComingSoon(
                      context,
                      'Generar lista automática',
                      'Estamos preparando esta funcionalidad para ti.',
                    ),
                  );
                }),
              ],
            ),
          );
        }),
      ),
      backgroundColor: cs.surface,
    );
  }

  Future<void> _openRecordsSheet(BuildContext context) async {
    final list = controller.selectedList.value;
    if (list == null) {
      _showComingSoon(
        context,
        'Lista no disponible',
        'Debes seleccionar una lista de asistencia antes de abrirla.',
      );
      return;
    }
    await controller.fetchSummary(showLoader: true);
    await controller.fetchRecords(page: controller.currentPage.value);
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AttendanceRecordsSheet(controller: controller),
    );
  }

  Future<void> _openSummarySheet(BuildContext context) async {
    final list = controller.selectedList.value;
    if (list == null) {
      _showComingSoon(
        context,
        'Resumen no disponible',
        'Selecciona una lista de asistencia para ver su resumen.',
      );
      return;
    }
    await controller.fetchSummary(showLoader: true);
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AttendanceSummarySheet(controller: controller),
    );
  }

  void _showComingSoon(BuildContext context, String title, String message) {
    if (Get.isSnackbarOpen) {
      Get.closeCurrentSnackbar();
    }
    Get.snackbar(
      title,
      message,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.all(16),
    );
  }
}

class _HeaderSection extends StatelessWidget {
  final String title;
  final String? description;
  const _HeaderSection({required this.title, this.description});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            cs.primary.withValues(alpha: .12),
            cs.secondary.withValues(alpha: .08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            description?.isNotEmpty == true
                ? description!
                : 'Visualiza y gestiona la asistencia de este grupo de votación.',
            style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

class _AttendanceListCard extends StatelessWidget {
  final AttendanceManagementController controller;
  final AttendanceList list;
  final VoidCallback onOpenRecords;
  final VoidCallback onOpenSummary;
  final VoidCallback onCreateList;
  final VoidCallback onGenerateAutomatic;

  const _AttendanceListCard({
    required this.controller,
    required this.list,
    required this.onOpenRecords,
    required this.onOpenSummary,
    required this.onCreateList,
    required this.onGenerateAutomatic,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final isActive = list.isActive;
    final chipColors = isActive
        ? (cs.primaryContainer, cs.onPrimaryContainer, 'ACTIVA')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVA');
    final desc = list.description;
    // list.notes
    final notes = list.notes;

    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: cs.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .05),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: cs.primary.withValues(alpha: .12),
                  ),
                  child: Icon(Icons.fact_check_outlined, color: cs.primary),
                ),
                const Spacer(),
                _StatusChip(
                  label: chipColors.$3,
                  background: chipColors.$1,
                  foreground: chipColors.$2,
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              list.title,
              style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            ),
            // list.description
            if (desc != null && desc.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                desc,
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
            if (notes != null && notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: cs.secondaryContainer.withValues(alpha: .4),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.sticky_note_2_outlined,
                        size: 18,
                        color: cs.onSecondaryContainer,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          notes,
                          style: tt.bodyMedium?.copyWith(
                            color: cs.onSecondaryContainer,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 20),
            _SummaryHighlights(controller: controller),
            const SizedBox(height: 20),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                OutlinedButton.icon(
                  onPressed: onCreateList,
                  icon: const Icon(Icons.add_circle_outline),
                  label: const Text('Crear lista'),
                ),
                OutlinedButton.icon(
                  onPressed: onGenerateAutomatic,
                  icon: const Icon(Icons.auto_awesome_outlined),
                  label: const Text('Generar lista automática'),
                ),
                FilledButton.icon(
                  onPressed: onOpenRecords,
                  icon: const Icon(Icons.inventory_2_outlined),
                  label: const Text('Abrir lista'),
                ),
                FilledButton.tonalIcon(
                  onPressed: onOpenSummary,
                  icon: const Icon(Icons.pie_chart_outline),
                  label: const Text('Resumen'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryHighlights extends StatelessWidget {
  final AttendanceManagementController controller;
  const _SummaryHighlights({required this.controller});

  String _formatPercent(double value) {
    if (value.isNaN || !value.isFinite) return '0.0%';
    final rounded = (value * 10).roundToDouble() / 10;
    return '${rounded.toStringAsFixed(1)}%';
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final summary = controller.summary.value;
      final isLoading = controller.isLoadingSummary.value && summary == null;
      if (isLoading) {
        return const Center(child: CircularProgressIndicator());
      }
      if (summary == null) {
        return Text(
          'Sin datos de resumen disponibles todavía.',
          style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
        );
      }
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _MiniStatChip(
            label: 'Total unidades',
            value: summary.totalUnits.toString(),
            icon: Icons.apartment_outlined,
          ),
          _MiniStatChip(
            label: 'Asistieron',
            value: summary.attendedUnits.toString(),
            icon: Icons.people_outline,
            color: cs.primary,
          ),
          _MiniStatChip(
            label: 'Asistencia (coef)',
            value: _formatPercent(summary.attendanceRateByCoef),
            icon: Icons.percent_outlined,
            color: cs.secondary,
          ),
          _MiniStatChip(
            label: 'Ausencia (coef)',
            value: _formatPercent(summary.absenceRateByCoef),
            icon: Icons.do_disturb_alt_outlined,
            color: cs.error,
          ),
        ],
      );
    });
  }
}

class _MiniStatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? color;
  const _MiniStatChip({
    required this.label,
    required this.value,
    required this.icon,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final fg = color ?? cs.primary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: fg.withValues(alpha: .08),
        border: Border.all(color: fg.withValues(alpha: .3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: fg),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                value,
                style: tt.titleMedium?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                label,
                style: tt.bodySmall?.copyWith(color: fg.withValues(alpha: .7)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AttendanceRecordsSheet extends StatelessWidget {
  final AttendanceManagementController controller;
  const _AttendanceRecordsSheet({required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final radius = const Radius.circular(28);

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: FractionallySizedBox(
        heightFactor: 0.92,
        child: Container(
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: BorderRadius.only(topLeft: radius, topRight: radius),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: cs.outlineVariant,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Lista de asistencia',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  controller.selectedList.value?.title ?? '',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: Obx(() {
                    final summary = controller.summary.value;
                    final records = controller.records;
                    final loadingRecords = controller.isLoadingRecords.value;
                    final error = controller.recordsError.value;

                    return CustomScrollView(
                      slivers: [
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 8,
                          ),
                          sliver: SliverToBoxAdapter(
                            child: _SummaryGrid(summary: summary),
                          ),
                        ),
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 8,
                          ),
                          sliver: SliverToBoxAdapter(
                            child: _FiltersSection(controller: controller),
                          ),
                        ),
                        if (loadingRecords)
                          const SliverFillRemaining(
                            hasScrollBody: false,
                            child: Center(child: CircularProgressIndicator()),
                          )
                        else if (error != null)
                          SliverFillRemaining(
                            hasScrollBody: false,
                            child: _InlineError(
                              message: error,
                              onRetry: () => controller.fetchRecords(),
                            ),
                          )
                        else if (records.isEmpty)
                          const SliverFillRemaining(
                            hasScrollBody: false,
                            child: _EmptyState(
                              icon: Icons.person_off_outlined,
                              title: 'Sin registros',
                              description:
                                  'No se encontraron unidades en esta lista.',
                            ),
                          )
                        else
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
                            sliver: SliverList.separated(
                              itemCount: records.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 14),
                              itemBuilder: (_, index) {
                                final record = records[index];
                                return _AttendanceRecordTile(
                                  controller: controller,
                                  record: record,
                                );
                              },
                            ),
                          ),
                      ],
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryGrid extends StatelessWidget {
  final AttendanceSummary? summary;
  const _SummaryGrid({required this.summary});

  String _formatPercent(double? value) {
    final v = (value ?? 0).toDouble();
    if (v.isNaN || !v.isFinite) return '0.0%';
    final rounded = (v * 10).roundToDouble() / 10;
    return '${rounded.toStringAsFixed(1)}%';
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final s = summary;
    if (s == null) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        alignment: Alignment.center,
        child: Text(
          'Cargando resumen de asistencia...',
          style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
        ),
      );
    }

    final items = [
      ('Total unidades', (s.totalUnits).toString(), Icons.apartment_outlined),
      ('Asistieron', (s.attendedUnits).toString(), Icons.people_alt_outlined),
      ('Ausentes', (s.absentUnits).toString(), Icons.person_off_outlined),
      ('Propietario', (s.attendedAsOwner).toString(), Icons.person_outline),
      (
        'Apoderado',
        (s.attendedAsProxy).toString(),
        Icons.assignment_ind_outlined,
      ),
      (
        'Asistencia (Coef)',
        _formatPercent(s.attendanceRateByCoef),
        Icons.percent_outlined,
      ),
      (
        'Ausencia (Coef)',
        _formatPercent(s.absenceRateByCoef),
        Icons.percent_rounded,
      ),
    ];

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        mainAxisExtent: 128,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final item = items[i];
        return _SummaryTile(label: item.$1, value: item.$2, icon: item.$3);
      },
    );
  }
}

class _SummaryTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _SummaryTile({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: cs.surfaceBright,
        border: Border.all(color: cs.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min, // 👈 permite ajustar al alto disponible
        children: [
          Icon(icon, size: 20, color: cs.primary),
          const SizedBox(height: 12),
          Text(
            value,
            style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            maxLines: 2, // 👈 evita desborde vertical
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _FiltersSection extends StatelessWidget {
  final AttendanceManagementController controller;
  const _FiltersSection({required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant),
        color: cs.surfaceContainerHigh,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filtros de asistencia',
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller.unitFilterCtrl,
                  decoration: InputDecoration(
                    labelText: 'Unidad',
                    labelStyle: const TextStyle(fontSize: 13),
                    hintText: 'Ej CASA 101',
                    hintStyle: const TextStyle(fontSize: 13),
                    prefixIcon: const Icon(Icons.home_work_outlined),
                    filled: true,
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  textInputAction: TextInputAction.search,
                  onSubmitted: (_) => controller.applyFilters(),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 170,
                child: Obx(() {
                  final selected = controller.attendanceFilter.value;
                  return DropdownButtonFormField<String?>(
                    initialValue: selected,
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(fontSize: 12),

                    decoration: InputDecoration(
                      labelText: 'Asistencia',
                      labelStyle: const TextStyle(fontSize: 12),
                      filled: true,
                      isDense: true,
                      prefixIcon: const Icon(Icons.filter_alt_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    items: const [
                      DropdownMenuItem<String?>(
                        value: null,
                        child: Text('Todos'),
                      ),
                      DropdownMenuItem<String?>(
                        value: 'true',
                        child: Text('Asistieron'),
                      ),
                      DropdownMenuItem<String?>(
                        value: 'false',
                        child: Text('No asistieron'),
                      ),
                    ],
                    onChanged: (value) {
                      controller.attendanceFilter.value = value;
                    },
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: controller.clearFilters,
                icon: const Icon(Icons.refresh_outlined),
                label: const Text('Limpiar'),
              ),
              const SizedBox(width: 8),
              FilledButton.icon(
                onPressed: controller.applyFilters,
                icon: const Icon(Icons.search),
                label: const Text('Aplicar'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AttendanceRecordTile extends StatefulWidget {
  final AttendanceManagementController controller;
  final AttendanceRecord record;
  const _AttendanceRecordTile({required this.controller, required this.record});

  @override
  State<_AttendanceRecordTile> createState() => _AttendanceRecordTileState();
}

class _AttendanceRecordTileState extends State<_AttendanceRecordTile> {
  bool _expanded = false;

  AttendanceManagementController get controller => widget.controller;
  AttendanceRecord get record => widget.record;

  bool get _isAttended => record.attendedAsOwner || record.attendedAsProxy;

  void _toggleExpanded() {
    setState(() {
      _expanded = !_expanded;
    });
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final isProcessing = controller.isRecordMarked(record.id);
    final unit = record.unitNumber;
    final unitLabel = (unit != null && unit.trim().isNotEmpty)
        ? unit
        : 'Sin unidad';

    final owner = record.residentName;
    final ownerLabel = (owner != null && owner.trim().isNotEmpty)
        ? owner.trim()
        : 'Sin propietario asignado';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant),
        color: cs.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .04),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _AttendanceMarker(
                  isActive: _isAttended,
                  isProcessing: isProcessing,
                  onTap: () => controller.toggleAttendance(record),
                ),
                const SizedBox(width: 12),
                Text(
                  'Asistencia',
                  style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: cs.primaryContainer.withValues(alpha: .5),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Text(
                    unitLabel,
                    style: tt.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: cs.onPrimaryContainer,
                    ),
                  ),
                ),
              ],
            ),
            AnimatedCrossFade(
              crossFadeState: _expanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
              firstChild: const SizedBox.shrink(),
              secondChild: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  const Divider(height: 24),
                  _InfoLine(
                    icon: Icons.person_outline,
                    label: 'Propietario',
                    value: ownerLabel,
                  ),
                  const SizedBox(height: 12),
                  _ProxySection(controller: controller, record: record),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _toggleExpanded,
                icon: Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                ),
                label: Text(_expanded ? 'Ver menos' : 'Ver más'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AttendanceMarker extends StatelessWidget {
  final bool isActive;
  final bool isProcessing;
  final VoidCallback onTap;
  const _AttendanceMarker({
    required this.isActive,
    required this.isProcessing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = isActive ? cs.primary : cs.outline;
    final background = isActive
        ? cs.primary.withValues(alpha: .12)
        : cs.surfaceContainerHigh;

    return InkWell(
      onTap: isProcessing ? null : onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: background,
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: .4)),
        ),
        alignment: Alignment.center,
        child: isProcessing
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                ),
              )
            : Icon(
                isActive
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_unchecked,
                color: color,
              ),
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoLine({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: tt.bodySmall?.copyWith(
                  color: cs.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProxySection extends StatelessWidget {
  final AttendanceManagementController controller;
  final AttendanceRecord record;
  const _ProxySection({required this.controller, required this.record});

  void _showProxyForm(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) {
        return _ProxyFormDialog(
          controller: controller,
          record: record,
        );
      },
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return Obx(() {
          final loading = controller.isProxyProcessing(record.id);
          return AlertDialog(
            title: const Text('Eliminar apoderado'),
            content: const Text(
              '¿Deseas eliminar el apoderado asignado a esta unidad?',
            ),
            actions: [
              TextButton(
                onPressed: loading ? null : () => Navigator.of(ctx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: loading
                    ? null
                    : () async {
                        final success =
                            await controller.deleteProxyForRecord(record: record);
                        if (success && Navigator.of(ctx).canPop()) {
                          Navigator.of(ctx).pop();
                        }
                      },
                child: Text(loading ? 'Eliminando…' : 'Eliminar'),
              ),
            ],
          );
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Obx(() {
      final isProcessing = controller.isProxyProcessing(record.id);
      final proxyName = record.proxyName?.trim() ?? '';
      final hasProxy = proxyName.isNotEmpty;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.badge_outlined, size: 18, color: cs.onSurfaceVariant),
              const SizedBox(width: 10),
              Text(
                'Apoderado',
                style: tt.bodySmall?.copyWith(
                  color: cs.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          if (!hasProxy)
            OutlinedButton.icon(
              onPressed: isProcessing ? null : () => _showProxyForm(context),
              icon: isProcessing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.add_outlined),
              label: Text(isProcessing ? 'Procesando…' : 'Agregar apoderado'),
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cs.secondaryContainer.withValues(alpha: .3),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    proxyName,
                    style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed:
                            isProcessing ? null : () => _showProxyForm(context),
                        icon: const Icon(Icons.edit_outlined, size: 18),
                        label: Text(isProcessing ? 'Actualizando…' : 'Editar'),
                      ),
                      TextButton.icon(
                        onPressed:
                            isProcessing ? null : () => _confirmDelete(context),
                        icon: const Icon(Icons.delete_outline, size: 18),
                        label: Text(isProcessing ? 'Eliminando…' : 'Eliminar'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      );
    });
  }
}

class _ProxyFormDialog extends StatefulWidget {
  final AttendanceManagementController controller;
  final AttendanceRecord record;

  const _ProxyFormDialog({
    required this.controller,
    required this.record,
  });

  bool get isEditing => (record.proxyId ?? 0) > 0;

  String get initialName => isEditing ? (record.proxyName ?? '') : '';

  @override
  State<_ProxyFormDialog> createState() => _ProxyFormDialogState();
}

class _ProxyFormDialogState extends State<_ProxyFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _controller;

  AttendanceManagementController get _attendanceController => widget.controller;
  AttendanceRecord get _record => widget.record;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialName);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit(BuildContext context) async {
    final isEditing = widget.isEditing;
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    final name = _controller.text.trim();
    final success = isEditing
        ? await _attendanceController.updateProxyForRecord(
            record: _record,
            proxyName: name,
          )
        : await _attendanceController.createProxyForRecord(
            record: _record,
            proxyName: name,
          );

    if (success && Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final loading = _attendanceController.isProxyProcessing(_record.id);
      return AlertDialog(
        title: Text(widget.isEditing ? 'Editar apoderado' : 'Agregar apoderado'),
        content: Form(
          key: _formKey,
          child: TextFormField(
            controller: _controller,
            decoration: const InputDecoration(
              labelText: 'Nombre del apoderado',
              hintText: 'Ingresa el nombre completo',
            ),
            autofocus: true,
            textCapitalization: TextCapitalization.words,
            textInputAction: TextInputAction.done,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Ingresa el nombre del apoderado';
              }
              return null;
            },
            onFieldSubmitted: (_) async {
              if (loading) return;
              await _handleSubmit(context);
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: loading ? null : () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: loading
                ? null
                : () async {
                    if (loading) return;
                    await _handleSubmit(context);
                  },
            child: Text(loading ? 'Guardando…' : 'Guardar'),
          ),
        ],
      );
    });
  }
}

class _AttendanceSummarySheet extends StatelessWidget {
  final AttendanceManagementController controller;
  const _AttendanceSummarySheet({required this.controller});

  String _formatPercent(double value) {
    if (value.isNaN || !value.isFinite) return '0.0%';
    final rounded = (value * 10).roundToDouble() / 10;
    return '${rounded.toStringAsFixed(1)}%';
  }

  double _progress(double value) {
    if (value <= 0) return 0;
    return (value.clamp(0, 100)) / 100;
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final radius = const Radius.circular(28);

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: Container(
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.only(topLeft: radius, topRight: radius),
        ),
        child: SafeArea(
          top: false,
          child: Obx(() {
            final summary = controller.summary.value;
            final isLoading =
                controller.isLoadingSummary.value && summary == null;

            return Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 48,
                  height: 5,
                  decoration: BoxDecoration(
                    color: cs.outlineVariant,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Resumen de asistencia',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  controller.selectedList.value?.title ?? '',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : summary == null
                        ? const Center(
                            child: _EmptyState(
                              icon: Icons.info_outline,
                              title: 'Sin información',
                              description:
                                  'Todavía no hay datos disponibles para esta lista.',
                            ),
                          )
                        : ListView(
                            children: [
                              _SummaryCard(
                                title: 'Asistencia general',
                                items: [
                                  _SummaryRowItem(
                                    label: 'Total unidades',
                                    value: summary.totalUnits.toString(),
                                  ),
                                  _SummaryRowItem(
                                    label: 'Asistieron',
                                    value: summary.attendedUnits.toString(),
                                  ),
                                  _SummaryRowItem(
                                    label: 'Ausentes',
                                    value: summary.absentUnits.toString(),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _SummaryCard(
                                title: 'Asistencia por propietario',
                                items: [
                                  _SummaryRowItem(
                                    label: 'Propietarios asistidos',
                                    value: summary.attendedAsOwner.toString(),
                                  ),
                                  _SummaryRowItem(
                                    label: 'Por apoderado',
                                    value: summary.attendedAsProxy.toString(),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _SummaryCard(
                                title: 'Porcentajes detallados',
                                items: [
                                  _SummaryRowItem(
                                    label: 'Asistencia (cantidad)',
                                    value: _formatPercent(
                                      summary.attendanceRate,
                                    ),
                                  ),
                                  _SummaryRowItem(
                                    label: 'Ausencia (cantidad)',
                                    value: _formatPercent(summary.absenceRate),
                                  ),
                                  _SummaryRowItem(
                                    label: 'Ausencia (coeficiente)',
                                    value: _formatPercent(
                                      summary.absenceRateByCoef,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _SummaryProgressCard(
                                attendanceProgress: _progress(
                                  summary.attendanceRateByCoef,
                                ),
                                absenceProgress: _progress(
                                  summary.absenceRateByCoef,
                                ),
                                attendanceLabel: _formatPercent(
                                  summary.attendanceRateByCoef,
                                ),
                                absenceLabel: _formatPercent(
                                  summary.absenceRateByCoef,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: FilledButton.tonal(
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                          child: const Text('Cerrar'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Obx(() {
                          final refreshing =
                              controller.isRefreshingSummary.value;
                          return FilledButton(
                            onPressed: refreshing
                                ? null
                                : controller.refreshSummaryManually,
                            child: Text(
                              refreshing ? 'Actualizando…' : 'Actualizar',
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final List<_SummaryRowItem> items;
  const _SummaryCard({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: cs.surfaceContainerHigh,
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          ...items.map((item) => item.build(context)).toList(),
        ],
      ),
    );
  }
}

class _SummaryRowItem {
  final String label;
  final String value;
  const _SummaryRowItem({required this.label, required this.value});

  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            ),
          ),
          Text(
            value,
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _SummaryProgressCard extends StatelessWidget {
  final double attendanceProgress;
  final double absenceProgress;
  final String attendanceLabel;
  final String absenceLabel;
  const _SummaryProgressCard({
    required this.attendanceProgress,
    required this.absenceProgress,
    required this.attendanceLabel,
    required this.absenceLabel,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: LinearGradient(
          colors: [
            cs.primary.withValues(alpha: .12),
            cs.error.withValues(alpha: .10),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Progreso de asistencia',
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 16),
          _ProgressRow(
            color: Colors.green,
            label: 'Asistencia por coeficiente',
            valueLabel: attendanceLabel,
            progress: attendanceProgress,
          ),
          const SizedBox(height: 16),
          _ProgressRow(
            color: cs.error,
            label: 'Ausencia por coeficiente',
            valueLabel: absenceLabel,
            progress: absenceProgress,
          ),
        ],
      ),
    );
  }
}

class _ProgressRow extends StatelessWidget {
  final Color color;
  final String label;
  final String valueLabel;
  final double progress;
  const _ProgressRow({
    required this.color,
    required this.label,
    required this.valueLabel,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            Text(valueLabel, style: tt.bodyMedium?.copyWith(color: color)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            minHeight: 12,
            value: progress,
            backgroundColor: color.withValues(alpha: .15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}

class _InlineError extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  const _InlineError({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: cs.errorContainer,
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: cs.onErrorContainer),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: cs.onErrorContainer),
            ),
          ),
          if (onRetry != null)
            TextButton(onPressed: onRetry, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.outlineVariant),
        color: cs.surfaceContainerHighest,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 54, color: cs.onSurfaceVariant),
          const SizedBox(height: 16),
          Text(
            title,
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
