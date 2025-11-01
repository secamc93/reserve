part of 'horizontal_property_detail_view.dart';

class _VotingTab extends GetWidget<HorizontalPropertyVotingController> {
  final String controllerTag;
  const _VotingTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final groups = List<HorizontalPropertyVotingGroup>.of(controller.groups);

      return RefreshIndicator(
        onRefresh: controller.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            SummaryHeader(
              title: 'Grupos de votación',
              subtitle: groups.isEmpty
                  ? 'Sin grupos registrados'
                  : '${groups.length} grupos disponibles',
              showProgress: isLoading,
              onRefresh: controller.refresh,
            ),
            const SizedBox(height: 16),
            if (error != null) ...[
              _InlineError(message: error),
              const SizedBox(height: 16),
            ],
            if (!isLoading && groups.isEmpty)
              const _EmptyState(
                icon: Icons.how_to_vote_outlined,
                title: 'No hay votaciones registradas.',
                subtitle:
                    'Cuando se creen nuevos procesos de votación aparecerán aquí.',
              )
            else ...[
              ...groups
                  .map(
                    (group) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _VotingGroupCard(
                        group: group,
                        onOpenAttendance: () {
                          final router = GoRouter.of(context);
                          final location = router.location;
                          final match =
                              RegExp(r'^/home\/(\d+)/').firstMatch(location);
                          final page = match?.group(1) ?? '0';
                          final propertyId = controller.propertyId;
                          final path =
                              '/home/$page/horizontal-properties/$propertyId/voting/${group.id}/attendance';
                          context.push(path, extra: group);
                        },
                      ),
                    ),
                  )
                  .toList(),
            ],
          ],
        ),
      );
    });
  }
}

class _VotingGroupCard extends StatelessWidget {
  final HorizontalPropertyVotingGroup group;
  final VoidCallback onOpenAttendance;
  const _VotingGroupCard({
    required this.group,
    required this.onOpenAttendance,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final (bgChip, fgChip, labelChip) = group.isActive
        ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVO')
        : (cs.errorContainer, cs.onErrorContainer, 'INACTIVO');

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onOpenAttendance,
        child: Ink(
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
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
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
                    color: cs.primary.withValues(alpha: .12),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Icon(Icons.how_to_vote_outlined, color: cs.primary),
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
              group.name,
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            if ((group.description?.isNotEmpty ?? false)) ...[
              const SizedBox(height: 6),
              Text(
                group.description!,
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _DetailLine(
                  icon: Icons.calendar_month_outlined,
                  label: 'Inicio',
                  value: _formatDate(group.votingStartDate),
                ),
                _DetailLine(
                  icon: Icons.event_outlined,
                  label: 'Fin',
                  value: _formatDate(group.votingEndDate),
                ),
                _DetailLine(
                  icon: Icons.gavel_outlined,
                  label: 'Requiere quórum',
                  value: group.requiresQuorum ? 'Sí' : 'No',
                ),
                _DetailLine(
                  icon: Icons.percent_outlined,
                  label: 'Quórum',
                  value: group.quorumPercentage != null
                      ? '${group.quorumPercentage}%'
                      : '--',
                ),
              ],
            ),
            const SizedBox(height: 16),
            _CardActions(
              onView: onOpenAttendance,
              onEdit: () => _showActionFeedback(
                'Editar votación',
                'Funcionalidad disponible próximamente.',
              ),
              onDelete: () => _showActionFeedback(
                'Eliminar votación',
                'Contacta al administrador para continuar con la acción.',
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '--';
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    return '$day/$month/$year';
  }
}
