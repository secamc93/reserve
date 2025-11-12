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
            Align(
              alignment: Alignment.centerLeft,
              child: FilledButton.icon(
                onPressed: () => _openGroupForm(context),
                icon: const Icon(Icons.add),
                label: const Text('Crear grupo de votación'),
              ),
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
            else
              ...groups
                  .map(
                    (group) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _VotingGroupCard(
                        controllerTag: controllerTag,
                        group: group,
                        onOpenAttendance: () => _openAttendance(context, group),
                        onEdit: () => _openGroupForm(context, group: group),
                      ),
                    ),
                  )
                  .toList(),
          ],
        ),
      );
    });
  }

  Future<void> _openAttendance(
    BuildContext context,
    HorizontalPropertyVotingGroup group,
  ) async {
    final state = GoRouterState.of(context);
    final segments = state.uri.pathSegments;
    final page = segments.length > 1 ? segments[1] : '0';
    final propertyId = controller.propertyId;
    final path =
        '/home/$page/horizontal-properties/$propertyId/voting/${group.id}/attendance';
    context.push(path, extra: group);
  }

  Future<void> _openGroupForm(
    BuildContext context, {
    HorizontalPropertyVotingGroup? group,
  }) async {
    final result =
        await showModalBottomSheet<HorizontalPropertyVotingGroupActionResult>(
          context: context,
          backgroundColor: Colors.transparent,
          useRootNavigator: true,
          isScrollControlled: true,
          builder: (_) => _VotingGroupFormBottomSheet(
            title: group == null ? 'Crear grupo de votación' : 'Editar grupo',
            actionLabel: group == null ? 'Crear grupo' : 'Guardar cambios',
            initialGroup: group,
            onSubmit: (payload) async {
              if (group == null) {
                return await controller.createGroup(payload);
              }
              return controller.updateGroup(group.id, payload);
            },
          ),
        );

    if (result == null) return;

    if (result.success) {
      final title = result.message ??
          (group == null ? 'Grupo creado' : 'Grupo actualizado');
      final detail = result.group != null
          ? 'El grupo ${result.group!.name} se ${group == null ? 'creó' : 'actualizó'} correctamente.'
          : 'La operación se completó correctamente.';
      _showSnack(title, detail);
    } else {
      _showSnack(
        'No se pudo guardar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }
}

class _VotingGroupCard extends StatelessWidget {
  final HorizontalPropertyVotingGroup group;
  final String controllerTag;
  final VoidCallback onOpenAttendance;
  final VoidCallback onEdit;

  const _VotingGroupCard({
    required this.group,
    required this.controllerTag,
    required this.onOpenAttendance,
    required this.onEdit,
  });

  HorizontalPropertyVotingController get _controller =>
      Get.find<HorizontalPropertyVotingController>(tag: controllerTag);

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isExpanded = _controller.isGroupExpanded(group.id);
      final isLoading = _controller.groupIsLoading(group.id);
      final error = _controller.groupErrorMessage(group.id);
      final votings = _controller.votingsForGroup(group.id);
      final isDeleting = _controller.deletingGroupIds.contains(group.id);

      final (bgChip, fgChip, labelChip) = group.isActive
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
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          group.name,
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          group.description?.isNotEmpty == true
                              ? group.description!
                              : 'Sin descripción registrada.',
                          style: tt.bodyMedium?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => _toggleExpanded(),
                    icon: Icon(
                      isExpanded
                          ? Icons.keyboard_arrow_up
                          : Icons.keyboard_arrow_down,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _StatusChip(
                    label: labelChip,
                    background: bgChip,
                    foreground: fgChip,
                  ),
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
                viewLabel: 'Gestión de asistencia',
                onView: onOpenAttendance,
                onEdit: onEdit,
                onDelete: isDeleting ? null : () => _confirmDelete(context),
                isDeleteDisabled: isDeleting,
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox.shrink(),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isLoading)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Center(
                            child: CircularProgressIndicator(strokeWidth: 2.4),
                          ),
                        )
                      else ...[
                        Align(
                          alignment: Alignment.centerLeft,
                          child: FilledButton.tonalIcon(
                            onPressed: () => _openVotingForm(context),
                            icon: const Icon(Icons.add),
                            label: const Text('Crear votación'),
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (error != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _InlineError(message: error),
                          ),
                        if (!isLoading && votings.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Text(
                              'Aún no se han creado votaciones para este grupo.',
                            ),
                          )
                        else
                          ...votings
                              .map(
                                (voting) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _VotingItemCard(
                                    controllerTag: controllerTag,
                                    group: group,
                                    voting: voting,
                                  ),
                                ),
                              )
                              .toList(),
                      ],
                    ],
                  ),
                ),
                crossFadeState: isExpanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
              ),
            ],
          ),
        ),
      );
    });
  }

  Future<void> _toggleExpanded() async {
    await _controller.toggleGroup(group.id);
  }

  Future<void> _openVotingForm(BuildContext context) async {
    await showModalBottomSheet<HorizontalPropertyVotingActionResult>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => _VotingFormBottomSheet(
        title: 'Crear votación',
        actionLabel: 'Crear votación',
        onSubmit: (payload) =>
            _controller.createVoting(groupId: group.id, data: payload),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final cs = Theme.of(context).colorScheme;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Eliminar grupo'),
        content: Text(
          '¿Quieres eliminar el grupo ${group.name}? Esta acción no se puede deshacer.',
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

    final result = await _controller.deleteGroup(group.id);
    if (result.success) {
      _showSnack(
        'Grupo eliminado',
        result.message ?? 'El grupo se eliminó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo eliminar',
        result.message ?? 'Inténtalo nuevamente más tarde.',
        isError: true,
      );
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '--';
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    return '$day/$month/$year';
  }
}

class _VotingItemCard extends StatelessWidget {
  final HorizontalPropertyVotingGroup group;
  final HorizontalPropertyVoting voting;
  final String controllerTag;

  const _VotingItemCard({
    required this.group,
    required this.voting,
    required this.controllerTag,
  });

  HorizontalPropertyVotingController get _controller =>
      Get.find<HorizontalPropertyVotingController>(tag: controllerTag);

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final isDeleting = _controller.deletingVotingIds.contains(voting.id);
    final toggling = _controller.togglingVotingIds.contains(voting.id);

    return Obx(() {
      final isExpanded = _controller.isVotingExpanded(group.id, voting.id);
      final optionsLoading = _controller.optionsAreLoading(group.id, voting.id);
      final votesLoading = _controller.votesAreLoading(group.id, voting.id);
      final optionsError = _controller.optionsErrorMessage(group.id, voting.id);
      final votesError = _controller.votesErrorMessage(group.id, voting.id);
      final options = _controller.optionsForVoting(group.id, voting.id);
      final votes = _controller.votesForVoting(group.id, voting.id);
      final summary = _controller.voteSummary(group.id, voting.id);
      final totalVotes = _controller.totalVotesFor(group.id, voting.id);

      final (bgChip, fgChip, labelChip) = voting.isActive
          ? (cs.secondaryContainer, cs.onSecondaryContainer, 'ACTIVA')
          : (cs.errorContainer, cs.onErrorContainer, 'INACTIVA');

      return DecoratedBox(
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          voting.title,
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          voting.description?.isNotEmpty == true
                              ? voting.description!
                              : 'Sin descripción registrada.',
                          style: tt.bodyMedium?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _StatusChip(
                    label: labelChip,
                    background: bgChip,
                    foreground: fgChip,
                  ),
                  IconButton(
                    onPressed: () => _toggleExpanded(),
                    icon: Icon(
                      isExpanded ? Icons.expand_less : Icons.expand_more,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _DetailLine(
                    icon: Icons.badge_outlined,
                    label: 'Tipo',
                    value: voting.votingType.toUpperCase(),
                  ),
                  _DetailLine(
                    icon: Icons.visibility_off_outlined,
                    label: 'Secreta',
                    value: voting.isSecret ? 'Sí' : 'No',
                  ),
                  _DetailLine(
                    icon: Icons.how_to_vote_outlined,
                    label: 'Permite abstención',
                    value: voting.allowAbstention ? 'Sí' : 'No',
                  ),
                  _DetailLine(
                    icon: Icons.numbers_outlined,
                    label: 'Orden',
                    value: voting.displayOrder.toString(),
                  ),
                  _DetailLine(
                    icon: Icons.percent_outlined,
                    label: 'Requerido',
                    value: voting.requiredPercentage != null
                        ? '${voting.requiredPercentage}%'
                        : '--',
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  FilledButton.icon(
                    onPressed:
                        voting.isActive ? () => _openLiveVoting(context) : null,
                    icon: const Icon(Icons.podcasts_outlined, size: 18),
                    label: const Text('Votación en vivo'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: () => _openVotingForm(context),
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    label: const Text('Editar'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: toggling
                        ? null
                        : () => _toggleStatus(context, !voting.isActive),
                    icon: Icon(
                      voting.isActive
                          ? Icons.pause_circle_outline
                          : Icons.play_circle_outline,
                      size: 18,
                    ),
                    label: Text(voting.isActive ? 'Desactivar' : 'Activar'),
                  ),
                  TextButton.icon(
                    onPressed: isDeleting
                        ? null
                        : () => _confirmDelete(context),
                    icon: isDeleting
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: cs.error,
                            ),
                          )
                        : const Icon(Icons.delete_outline, size: 18),
                    label: Text(isDeleting ? 'Eliminando...' : 'Eliminar'),
                  ),
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox.shrink(),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Opciones de votación',
                            style: tt.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const Spacer(),
                          TextButton.icon(
                            onPressed: () => _openOptionForm(context),
                            icon: const Icon(Icons.add_outlined),
                            label: const Text('Agregar opción'),
                          ),
                        ],
                      ),
                      if (optionsLoading)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Center(
                            child: CircularProgressIndicator(strokeWidth: 2.2),
                          ),
                        )
                      else if (optionsError != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _InlineError(message: optionsError!),
                        )
                      else if (options.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: Text('Aún no se han registrado opciones.'),
                        )
                      else
                        ...options.map(
                          (option) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                color: cs.surface,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: cs.outlineVariant),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                leading: CircleAvatar(
                                  backgroundColor:
                                      _parseHexColor(option.color) ?? cs.primary,
                                  child: Text(
                                    option.optionCode.toUpperCase(),
                                    style: tt.bodySmall?.copyWith(
                                      color: cs.onPrimary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                title: Text(option.optionText),
                                subtitle: Text(
                                  'Orden ${option.displayOrder}${option.isActive ? '' : ' · Inactiva'}',
                                ),
                                trailing: IconButton(
                                  tooltip: 'Eliminar opción',
                                  onPressed:
                                      _controller.isDeletingOption(
                                        group.id,
                                        voting.id,
                                        option.id,
                                      )
                                      ? null
                                      : () => _deleteOption(context, option),
                                  icon:
                                      _controller.isDeletingOption(
                                        group.id,
                                        voting.id,
                                        option.id,
                                      )
                                      ? SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2.2,
                                            color: cs.error,
                                          ),
                                        )
                                      : const Icon(Icons.delete_outline),
                                ),
                              ),
                            ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      Text(
                        'Resultados de votación',
                        style: tt.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      DecoratedBox(
                        decoration: BoxDecoration(
                          color: cs.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: cs.outlineVariant),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Resumen por opción',
                                style: tt.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (totalVotes == 0)
                                const Text('Aún no se han registrado votos.')
                              else
                                ...options.map((option) {
                                  final int count = summary[option.id] ?? 0;
                                  final double percentage = totalVotes == 0
                                      ? 0.0
                                      : (count / totalVotes)
                                            .clamp(0.0, 1.0)
                                            .toDouble();
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(option.optionText),
                                            ),
                                            Text(
                                              '${_formatOneDecimal(percentage * 100)}%',
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: LinearProgressIndicator(
                                            value: percentage,
                                            minHeight: 8,
                                            backgroundColor:
                                                cs.surfaceContainerHighest,
                                            valueColor: AlwaysStoppedAnimation(
                                              _parseHexColor(option.color) ??
                                                  cs.primary,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '$count voto${count == 1 ? '' : 's'}',
                                        ),
                                      ],
                                    ),
                                  );
                                }),
                              const SizedBox(height: 16),
                              Text(
                                'Votos individuales',
                                style: tt.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (votesLoading)
                                const Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.2,
                                    ),
                                  ),
                                )
                              else if (votesError != null)
                                _InlineError(message: votesError!)
                              else if (votes.isEmpty)
                                const Text(
                                  'No se han registrado votos para esta votación.',
                                )
                              else
                                ...votes.map((vote) {
                                  final option = _controller.optionById(
                                    groupId: group.id,
                                    votingId: voting.id,
                                    optionId: vote.votingOptionId,
                                  );
                                  return Column(
                                    children: [
                                      DecoratedBox(
                                        decoration: BoxDecoration(
                                          color: cs.surfaceContainerHighest,
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: ListTile(
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                horizontal: 16,
                                                vertical: 4,
                                              ),
                                          title: Text(
                                            option?.optionText ??
                                                'Opción ${vote.votingOptionId}',
                                          ),
                                          subtitle: Text(
                                            'Unidad ${vote.propertyUnitId} · ${vote.id} · ${_formatDateTime(vote.votedAt)}',
                                          ),
                                          trailing: IconButton(
                                            tooltip: 'Eliminar voto',
                                            onPressed:
                                                _controller.isDeletingVote(
                                                  group.id,
                                                  voting.id,
                                                  vote.id,
                                                )
                                                ? null
                                                : () => _deleteVote(
                                                    context,
                                                    vote,
                                                  ),
                                            icon:
                                                _controller.isDeletingVote(
                                                  group.id,
                                                  voting.id,
                                                  vote.id,
                                                )
                                                ? SizedBox(
                                                    width: 18,
                                                    height: 18,
                                                    child:
                                                        CircularProgressIndicator(
                                                          strokeWidth: 2.2,
                                                          color: cs.error,
                                                        ),
                                                  )
                                                : const Icon(
                                                    Icons.delete_outline,
                                                  ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(height: 10),
                                    ],
                                  );
                                }),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                crossFadeState: isExpanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
              ),
            ],
          ),
        ),
      );
    });
  }

  Future<void> _toggleExpanded() async {
    await _controller.toggleVotingExpanded(group.id, voting.id);
  }

  Future<void> _openVotingForm(BuildContext context) async {
    final result =
        await showModalBottomSheet<HorizontalPropertyVotingActionResult>(
          context: context,
          backgroundColor: Colors.transparent,
          useRootNavigator: true,
          isScrollControlled: true,
          builder: (_) => _VotingFormBottomSheet(
            title: 'Editar votación',
            actionLabel: 'Guardar cambios',
            initialVoting: voting,
            onSubmit: (payload) => _controller.updateVoting(
              groupId: group.id,
              votingId: voting.id,
              data: payload,
            ),
          ),
        );

    if (result == null) return;

    if (result.success) {
      _showSnack(
        'Votación actualizada',
        result.message ?? 'La votación se actualizó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo guardar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }

  Future<void> _toggleStatus(BuildContext context, bool activate) async {
    final result = await _controller.toggleVotingStatus(
      groupId: group.id,
      votingId: voting.id,
      activate: activate,
    );
    if (result.success) {
      _showSnack(
        activate ? 'Votación activada' : 'Votación desactivada',
        result.message ?? 'El estado se actualizó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo actualizar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final cs = Theme.of(context).colorScheme;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Eliminar votación'),
        content: Text(
          '¿Quieres eliminar la votación ${voting.title}? Esta acción no se puede deshacer.',
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

    final result = await _controller.deleteVoting(
      groupId: group.id,
      votingId: voting.id,
    );
    if (result.success) {
      _showSnack(
        'Votación eliminada',
        result.message ?? 'La votación se eliminó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo eliminar',
        result.message ?? 'Inténtalo nuevamente más tarde.',
        isError: true,
      );
    }
  }

  Future<void> _openOptionForm(BuildContext context) async {
    final result =
        await showModalBottomSheet<HorizontalPropertyVotingOptionActionResult>(
          context: context,
          backgroundColor: Colors.transparent,
          useRootNavigator: true,
          isScrollControlled: true,
          builder: (_) => _VotingOptionFormBottomSheet(
            onSubmit: (payload) => _controller.createVotingOption(
              groupId: group.id,
              votingId: voting.id,
              data: payload,
            ),
          ),
        );

    if (result == null) return;

    if (result.success) {
      _showSnack(
        'Opción agregada',
        result.message ?? 'La opción se registró correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo agregar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }

  Future<void> _deleteOption(
    BuildContext context,
    HorizontalPropertyVotingOption option,
  ) async {
    final cs = Theme.of(context).colorScheme;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Eliminar opción'),
        content: Text('¿Quieres eliminar la opción ${option.optionText}?'),
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

    final result = await _controller.deleteVotingOption(
      groupId: group.id,
      votingId: voting.id,
      optionId: option.id,
    );
    if (result.success) {
      _showSnack(
        'Opción eliminada',
        result.message ?? 'La opción se eliminó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo eliminar',
        result.message ?? 'Inténtalo nuevamente más tarde.',
        isError: true,
      );
    }
  }

  Future<void> _deleteVote(
    BuildContext context,
    HorizontalPropertyVotingVote vote,
  ) async {
    final result = await _controller.deleteVote(
      groupId: group.id,
      votingId: voting.id,
      voteId: vote.id,
    );
    if (result.success) {
      _showSnack(
        'Voto eliminado',
        result.message ?? 'El voto se eliminó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo eliminar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }

  Future<void> _openLiveVoting(BuildContext context) async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => _VotingLiveBottomSheet(
        controllerTag: controllerTag,
        group: group,
        voting: voting,
      ),
    );
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return '--';
    final formatter = DateFormat('dd/MM/yyyy · HH:mm');
    return formatter.format(date);
  }
}

class _VotingGroupFormBottomSheet extends StatefulWidget {
  final String title;
  final String actionLabel;
  final HorizontalPropertyVotingGroup? initialGroup;
  final Future<HorizontalPropertyVotingGroupActionResult> Function(
    Map<String, dynamic> data,
  )
  onSubmit;

  const _VotingGroupFormBottomSheet({
    required this.title,
    required this.actionLabel,
    this.initialGroup,
    required this.onSubmit,
  });

  @override
  State<_VotingGroupFormBottomSheet> createState() =>
      _VotingGroupFormBottomSheetState();
}

class _VotingGroupFormBottomSheetState
    extends State<_VotingGroupFormBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _descriptionCtrl;
  late final TextEditingController _notesCtrl;
  DateTime? _startDate;
  DateTime? _endDate;
  bool _requiresQuorum = false;
  double _quorumValue = 50;
  bool _saving = false;
  String? _errorMessage;
  int? _createdByUserId;

  @override
  void initState() {
    super.initState();
    final group = widget.initialGroup;
    _nameCtrl = TextEditingController(text: group?.name ?? '');
    _descriptionCtrl = TextEditingController(text: group?.description ?? '');
    _notesCtrl = TextEditingController();
    _startDate = group?.votingStartDate;
    _endDate = group?.votingEndDate;
    _requiresQuorum = group?.requiresQuorum ?? false;
    _quorumValue = (group?.quorumPercentage ?? _quorumValue.toInt()).toDouble();
    final loginCtrl =
        Get.isRegistered<LoginController>() ? Get.find<LoginController>() : null;
    _createdByUserId =
        group?.createdByUserId ?? loginCtrl?.sessionModel.value?.data.user.id;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descriptionCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime({required bool isStart}) async {
    final current = isStart ? _startDate : _endDate;
    final now = DateTime.now();
    final initialDate = current ?? now;
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (pickedDate == null) return;
    final initialTime = TimeOfDay.fromDateTime(current ?? now);
    final pickedTime = await showTimePicker(
      context: context,
      initialTime: initialTime,
    );
    if (pickedTime == null) return;
    final combined = DateTime(
      pickedDate.year,
      pickedDate.month,
      pickedDate.day,
      pickedTime.hour,
      pickedTime.minute,
      current?.second ?? 0,
      current?.millisecond ?? 0,
      current?.microsecond ?? 0,
    );
    setState(() {
      if (isStart) {
        _startDate = combined;
      } else {
        _endDate = combined;
      }
    });
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'name': _nameCtrl.text.trim(),
      'description': _emptyToNull(_descriptionCtrl.text.trim()),
      'notes': _emptyToNull(_notesCtrl.text.trim()),
      'requires_quorum': _requiresQuorum,
    };
    if (_requiresQuorum) {
      payload['quorum_percentage'] = _quorumValue.round();
    }
    if (_startDate != null) {
      payload['voting_start_date'] = _formatDateForPayload(_startDate!);
    }
    if (_endDate != null) {
      payload['voting_end_date'] = _formatDateForPayload(_endDate!);
    }
    if (widget.initialGroup == null && _createdByUserId != null) {
      payload['created_by_user_id'] = _createdByUserId;
    }
    return payload;
  }

  String? _emptyToNull(String? value) {
    if (value == null) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  String _formatDateForPayload(DateTime value) {
    final local = value.toLocal();
    final datePart = DateFormat("yyyy-MM-dd'T'HH:mm:ss").format(local);
    final micros =
        (local.millisecond * 1000 + local.microsecond).toString().padLeft(6, '0');
    final offset = local.timeZoneOffset;
    final sign = offset.isNegative ? '-' : '+';
    final hours = offset.inHours.abs().toString().padLeft(2, '0');
    final minutes = (offset.inMinutes.abs() % 60).toString().padLeft(2, '0');
    return '$datePart.$micros$sign$hours:$minutes';
  }

  Future<void> _handleSubmit() async {
    if (_saving) return;
    final form = _formKey.currentState;
    if (form == null || !form.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.onSubmit(_buildPayload());
      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _saving = false;
          _errorMessage =
              result.message ??
              'No se pudo guardar el grupo. Inténtalo nuevamente.';
        });
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _errorMessage =
            'Ocurrió un error al guardar el grupo. Inténtalo nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

    InputDecoration decoration(String label, {String? hint}) {
      return InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: cs.surfaceContainerHighest,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: cs.outlineVariant),
        ),
      );
    }

    return FractionallySizedBox(
      heightFactor: 0.95,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.title,
                              style: tt.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Completa la información del grupo de votación para continuar.',
                              style: tt.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: _nameCtrl,
                              decoration: decoration('Nombre del grupo'),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Ingresa un nombre';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _descriptionCtrl,
                              decoration: decoration('Descripción'),
                              maxLines: 2,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _notesCtrl,
                              decoration: decoration('Notas'),
                              maxLines: 2,
                            ),
                            const SizedBox(height: 12),
                            SwitchListTile.adaptive(
                              value: _requiresQuorum,
                              onChanged: (value) {
                                setState(() {
                                  _requiresQuorum = value;
                                });
                              },
                              title: const Text('Requiere quórum'),
                              contentPadding: EdgeInsets.zero,
                            ),
                            if (_requiresQuorum) ...[
                              const SizedBox(height: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Porcentaje de quórum',
                                          style: tt.bodyMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      Text('${_quorumValue.round()}%'),
                                    ],
                                  ),
                                  Slider.adaptive(
                                    value: _quorumValue,
                                    min: 0,
                                    max: 100,
                                    divisions: 100,
                                    label: '${_quorumValue.round()}%',
                                    onChanged: (value) {
                                      setState(() {
                                        _quorumValue = value;
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _DateField(
                                    label: 'Fecha inicio',
                                    date: _startDate,
                                    onTap: () => _pickDateTime(isStart: true),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _DateField(
                                    label: 'Fecha fin',
                                    date: _endDate,
                                    onTap: () => _pickDateTime(isStart: false),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            if (_errorMessage != null)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _InlineError(message: _errorMessage!),
                              ),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: _saving
                                        ? null
                                        : () => Navigator.of(context).maybePop(),
                                    child: const Text('Cancelar'),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: FilledButton(
                                    onPressed: _saving ? null : _handleSubmit,
                                    child: _saving
                                        ? const SizedBox(
                                            height: 22,
                                            width: 22,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.4,
                                            ),
                                          )
                                        : Text(widget.actionLabel),
                                  ),
                                ),
                              ],
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
        ),
      ),
    );
  }
}

class _VotingFormBottomSheet extends StatefulWidget {
  final String title;
  final String actionLabel;
  final HorizontalPropertyVoting? initialVoting;
  final Future<HorizontalPropertyVotingActionResult> Function(
    Map<String, dynamic> data,
  )
  onSubmit;

  const _VotingFormBottomSheet({
    required this.title,
    required this.actionLabel,
    this.initialVoting,
    required this.onSubmit,
  });

  @override
  State<_VotingFormBottomSheet> createState() => _VotingFormBottomSheetState();
}

class _VotingFormBottomSheetState extends State<_VotingFormBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleCtrl;
  late final TextEditingController _descriptionCtrl;
  late final TextEditingController _typeCtrl;
  late final TextEditingController _orderCtrl;
  late final TextEditingController _requiredCtrl;
  bool _allowAbstention = true;
  bool _isSecret = false;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final voting = widget.initialVoting;
    _titleCtrl = TextEditingController(text: voting?.title ?? '');
    _descriptionCtrl = TextEditingController(text: voting?.description ?? '');
    _typeCtrl = TextEditingController(text: voting?.votingType ?? 'simple');
    _orderCtrl = TextEditingController(
      text: voting?.displayOrder.toString() ?? '1',
    );
    _requiredCtrl = TextEditingController(
      text: voting?.requiredPercentage?.toString() ?? '',
    );
    _allowAbstention = voting?.allowAbstention ?? true;
    _isSecret = voting?.isSecret ?? false;
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descriptionCtrl.dispose();
    _typeCtrl.dispose();
    _orderCtrl.dispose();
    _requiredCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'title': _titleCtrl.text.trim(),
      'description': _emptyToNull(_descriptionCtrl.text.trim()),
      'voting_type': _typeCtrl.text.trim(),
      'allow_abstention': _allowAbstention,
      'is_secret': _isSecret,
      'display_order': int.tryParse(_orderCtrl.text.trim()) ?? 0,
    };
    final required = int.tryParse(_requiredCtrl.text.trim());
    if (required != null) {
      payload['required_percentage'] = required;
    }
    return payload;
  }

  String? _emptyToNull(String? value) {
    if (value == null) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  Future<void> _handleSubmit() async {
    if (_saving) return;
    final form = _formKey.currentState;
    if (form == null || !form.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.onSubmit(_buildPayload());
      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _saving = false;
          _errorMessage = result.message ?? 'No se pudo guardar la votación.';
        });
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _errorMessage =
            'Ocurrió un error al guardar la votación. Inténtalo nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

    InputDecoration decoration(String label, {String? hint}) {
      return InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: cs.surfaceContainerHighest,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: cs.outlineVariant),
        ),
      );
    }

    return FractionallySizedBox(
      heightFactor: 0.95,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.title,
                              style: tt.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Define los parámetros de la votación.',
                              style: tt.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: _titleCtrl,
                              decoration: decoration('Título de la votación'),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Ingresa un título';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _descriptionCtrl,
                              decoration: decoration('Descripción'),
                              maxLines: 2,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _typeCtrl,
                              decoration: decoration('Tipo de votación'),
                            ),
                            const SizedBox(height: 12),
                            SwitchListTile.adaptive(
                              value: _allowAbstention,
                              onChanged: (value) {
                                setState(() {
                                  _allowAbstention = value;
                                });
                              },
                              title: const Text('Permitir abstención'),
                              contentPadding: EdgeInsets.zero,
                            ),
                            SwitchListTile.adaptive(
                              value: _isSecret,
                              onChanged: (value) {
                                setState(() {
                                  _isSecret = value;
                                });
                              },
                              title: const Text('Votación secreta'),
                              contentPadding: EdgeInsets.zero,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _orderCtrl,
                              decoration: decoration('Orden de visualización'),
                              keyboardType: TextInputType.number,
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _requiredCtrl,
                              decoration: decoration(
                                'Porcentaje requerido (opcional)',
                              ),
                              keyboardType: TextInputType.number,
                            ),
                            const SizedBox(height: 16),
                            if (_errorMessage != null)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _InlineError(message: _errorMessage!),
                              ),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: _saving ? null : _handleSubmit,
                                child: _saving
                                    ? const SizedBox(
                                        height: 22,
                                        width: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.4,
                                        ),
                                      )
                                    : Text(widget.actionLabel),
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
        ),
      ),
    );
  }
}

class _VotingOptionFormBottomSheet extends StatefulWidget {
  final Future<HorizontalPropertyVotingOptionActionResult> Function(
    Map<String, dynamic> data,
  )
  onSubmit;

  const _VotingOptionFormBottomSheet({required this.onSubmit});

  @override
  State<_VotingOptionFormBottomSheet> createState() =>
      _VotingOptionFormBottomSheetState();
}

class _VotingOptionFormBottomSheetState
    extends State<_VotingOptionFormBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _textCtrl;
  late final TextEditingController _codeCtrl;
  late final TextEditingController _orderCtrl;
  Color? _selectedColor;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _textCtrl = TextEditingController();
    _codeCtrl = TextEditingController();
    _orderCtrl = TextEditingController(text: '1');
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _codeCtrl.dispose();
    _orderCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic> _buildPayload() {
    final payload = <String, dynamic>{
      'option_text': _textCtrl.text.trim(),
      'option_code': _codeCtrl.text.trim(),
      'display_order': int.tryParse(_orderCtrl.text.trim()) ?? 0,
    };
    if (_selectedColor != null) {
      payload['color'] = ColorTools.colorCode(
        _selectedColor!,
        //  enableAlpha: false
      );
    }
    return payload;
  }

  Future<void> _pickColor() async {
    final color = await showColorPickerDialog(
      context,
      _selectedColor ?? Theme.of(context).colorScheme.primary,
      title: const Text('Selecciona un color'),
      showColorCode: true,
      colorCodeHasColor: true,
      pickersEnabled: const <ColorPickerType, bool>{ColorPickerType.both: true},
    );
    if (!mounted) return;
    setState(() {
      _selectedColor = color;
    });
  }

  Future<void> _handleSubmit() async {
    if (_saving) return;
    final form = _formKey.currentState;
    if (form == null || !form.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.onSubmit(_buildPayload());
      if (!mounted) return;
      if (!result.success) {
        setState(() {
          _saving = false;
          _errorMessage = result.message ?? 'No se pudo agregar la opción.';
        });
        return;
      }
      Navigator.of(context).pop(result);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _errorMessage =
            'Ocurrió un error al guardar la opción. Inténtalo nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

    InputDecoration decoration(String label, {String? hint}) {
      return InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: cs.surfaceContainerHighest,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: cs.outlineVariant),
        ),
      );
    }

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Agregar opción de votación',
                              style: tt.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Define el código, nombre y color de la opción.',
                              style: tt.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: _textCtrl,
                              decoration: decoration('Nombre de la opción'),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Ingresa un nombre para la opción';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _codeCtrl,
                              decoration: decoration('Código'),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Ingresa un código';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _orderCtrl,
                              decoration: decoration('Orden de visualización'),
                              keyboardType: TextInputType.number,
                            ),
                            const SizedBox(height: 12),
                            OutlinedButton.icon(
                              onPressed: _pickColor,
                              icon: CircleAvatar(
                                radius: 10,
                                backgroundColor: _selectedColor ?? cs.primary,
                              ),
                              label: Text(
                                _selectedColor == null
                                    ? 'Seleccionar color'
                                    : 'Cambiar color',
                              ),
                            ),
                            if (_selectedColor != null) ...[
                              const SizedBox(height: 8),
                              Text(
                                ColorTools.colorCode(
                                  _selectedColor!,
                                  // enableAlpha: false,
                                ),
                                style: tt.bodySmall?.copyWith(
                                  color: cs.onSurfaceVariant,
                                ),
                              ),
                            ],
                            const SizedBox(height: 16),
                            if (_errorMessage != null)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _InlineError(message: _errorMessage!),
                              ),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: _saving ? null : _handleSubmit,
                                child: _saving
                                    ? const SizedBox(
                                        height: 22,
                                        width: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.4,
                                        ),
                                      )
                                    : const Text('Guardar opción'),
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
        ),
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final DateTime? date;
  final VoidCallback onTap;

  const _DateField({
    required this.label,
    required this.date,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final value = date == null
        ? 'Sin definir'
        : DateFormat('dd/MM/yyyy · HH:mm').format(date!.toLocal());

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

class _VotingLiveBottomSheet extends StatefulWidget {
  final String controllerTag;
  final HorizontalPropertyVotingGroup group;
  final HorizontalPropertyVoting voting;

  const _VotingLiveBottomSheet({
    required this.controllerTag,
    required this.group,
    required this.voting,
  });

  @override
  State<_VotingLiveBottomSheet> createState() => _VotingLiveBottomSheetState();
}

class _VotingLiveBottomSheetState extends State<_VotingLiveBottomSheet> {
  late final String _liveTag;
  VotingLiveController? _controller;
  String? _initError;
  late final TextEditingController _searchCtrl;

  @override
  void initState() {
    super.initState();
    _liveTag =
        '${widget.controllerTag}-${widget.group.id}-${widget.voting.id}-live';
    try {
      final parent = Get.find<HorizontalPropertyVotingController>(
        tag: widget.controllerTag,
      );
      _controller = Get.put(
        VotingLiveController(
          parent: parent,
          groupId: widget.group.id,
          votingId: widget.voting.id,
        ),
        tag: _liveTag,
      );
    } catch (error, stackTrace) {
      debugPrint('No se pudo inicializar VotingLiveController: $error');
      debugPrint('Stack: $stackTrace');
      _initError =
          'No se pudo iniciar la transmisión en vivo. Inténtalo más tarde.';
    }
    _searchCtrl = TextEditingController();
  }

  @override
  void dispose() {
    if (_controller != null &&
        Get.isRegistered<VotingLiveController>(tag: _liveTag)) {
      Get.delete<VotingLiveController>(tag: _liveTag);
    }
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _openVoteSheet({HorizontalPropertyVotingLiveUnit? unit}) async {
    final controller = _controller;
    if (controller == null) {
      _showSnack(
        'Acción no disponible',
        _initError ?? 'No se pudo preparar la votación en vivo.',
        isError: true,
      );
      return;
    }
    final result = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) =>
          _VoteCreationBottomSheet(controller: controller, initialUnit: unit),
    );

    if (result == true) {
      _showSnack('Voto registrado', 'El voto se registró correctamente.');
    }
  }

  Future<void> _confirmDeleteVote(HorizontalPropertyVotingLiveUnit unit) async {
    final controller = _controller;
    if (controller == null) {
      _showSnack(
        'Acción no disponible',
        _initError ?? 'No se pudo preparar la votación en vivo.',
        isError: true,
      );
      return;
    }

    final vote = controller.parent.voteForUnit(
      groupId: controller.groupId,
      votingId: controller.votingId,
      propertyUnitId: unit.propertyUnitId,
    );
    if (vote == null) {
      _showSnack(
        'No fue posible eliminar',
        'No encontramos un voto registrado para esta unidad.',
        isError: true,
      );
      return;
    }

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
    if (result.success) {
      _showSnack(
        'Voto eliminado',
        result.message ?? 'El voto se eliminó correctamente.',
      );
    } else {
      _showSnack(
        'No se pudo eliminar',
        result.message ?? 'Inténtalo nuevamente en unos instantes.',
        isError: true,
      );
    }
  }

  Widget _buildResponsiveWrap({
    required double maxWidth,
    required double minItemWidth,
    required List<Widget> items,
    double spacing = 12,
  }) {
    final width = _computeItemWidth(maxWidth, minItemWidth, spacing);
    return Wrap(
      spacing: spacing,
      runSpacing: spacing,
      children:
          items.map((child) => SizedBox(width: width, child: child)).toList(),
    );
  }

  double _computeItemWidth(double maxWidth, double minItemWidth, double spacing) {
    if (maxWidth.isInfinite) return minItemWidth;
    int columns = (maxWidth / (minItemWidth + spacing)).floor();
    if (columns < 1) columns = 1;
    while (columns > 1) {
      final totalSpacing = spacing * (columns - 1);
      final candidate = (maxWidth - totalSpacing) / columns;
      if (candidate >= minItemWidth) {
        return candidate;
      }
      columns -= 1;
    }
    return maxWidth;
  }

  List<_LiveOptionSummaryData> _buildOptionSummaries({
    required VotingLiveController controller,
    required HorizontalPropertyVotingGroupLiveData? liveData,
    required List<HorizontalPropertyVotingLiveUnit> units,
    required ColorScheme colorScheme,
  }) {
    final resultsByOption = {
      for (final result in controller.liveResults)
        result.votingOptionId: result,
    };

    final totalUnits = liveData?.totalUnits ?? units.length;
    final totalCoefficient = _sumCoefficients(units);

    final hasData = totalUnits > 0 ||
        controller.liveResults.isNotEmpty ||
        units.isNotEmpty;
    if (!hasData) {
      return const [];
    }

    final unitsByOption = <int, List<HorizontalPropertyVotingLiveUnit>>{};
    for (final unit in units) {
      final optionId = unit.votingOptionId;
      if (optionId == null) continue;
      unitsByOption
          .putIfAbsent(optionId, () => <HorizontalPropertyVotingLiveUnit>[])
          .add(unit);
    }

    final summaries = <_LiveOptionSummaryData>[];
    final options = List<HorizontalPropertyVotingOption>.of(controller.options)
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

    final processedOptionIds = <int>{};

    for (final option in options) {
      final optionUnits = unitsByOption[option.id] ?? const [];
      final result = resultsByOption[option.id];
      final count = result?.voteCount ?? optionUnits.length;
      final coefficientSum = _sumCoefficients(optionUnits);
      final percentage = totalUnits > 0
          ? _calculatePercentage(count, totalUnits)
          : (result?.percentage ?? 0);
      final coefficientPercentage = totalCoefficient > 0
          ? _calculatePercentage(coefficientSum, totalCoefficient)
          : null;
      final color = _parseHexColor(option.color) ??
          _parseHexColor(result?.color) ??
          colorScheme.primary;

      summaries.add(
        _LiveOptionSummaryData(
          label: option.optionText,
          code: option.optionCode,
          count: count,
          unitPercentage: percentage,
          coefficientPercentage: coefficientPercentage,
          accentColor: color,
        ),
      );
      processedOptionIds.add(option.id);
    }

    for (final result in controller.liveResults) {
      if (processedOptionIds.contains(result.votingOptionId)) continue;
      final optionUnits = unitsByOption[result.votingOptionId] ?? const [];
      final color =
          _parseHexColor(result.color) ?? colorScheme.secondaryContainer;
      summaries.add(
        _LiveOptionSummaryData(
          label: result.optionText.isNotEmpty
              ? result.optionText
              : 'Opción ${result.votingOptionId}',
          code: result.optionCode,
          count: result.voteCount,
          unitPercentage: totalUnits > 0
              ? _calculatePercentage(result.voteCount, totalUnits)
              : result.percentage,
          coefficientPercentage: totalCoefficient > 0
              ? _calculatePercentage(
                  _sumCoefficients(optionUnits),
                  totalCoefficient,
                )
              : null,
          accentColor: color,
        ),
      );
    }

    final pendingUnits = units.where((unit) => !unit.hasVoted).toList();
    final pendingCountRaw = liveData?.unitsPending ?? pendingUnits.length;
    final pendingCount = pendingCountRaw < 0 ? 0 : pendingCountRaw;
    final pendingPercentage = totalUnits > 0
        ? _calculatePercentage(pendingCount, totalUnits)
        : 0;
    final pendingCoefficientPercentage = totalCoefficient > 0
        ? _calculatePercentage(
            _sumCoefficients(pendingUnits),
            totalCoefficient,
          )
        : null;

    summaries.insert(
      0,
      _LiveOptionSummaryData(
        label: 'No votado',
        code: '',
        count: pendingCount,
        unitPercentage: pendingPercentage,
        coefficientPercentage: pendingCoefficientPercentage,
        accentColor: colorScheme.outline,
        isPending: true,
      ),
    );

    return summaries;
  }

  List<_LiveSummaryData> _buildSummaryData({
    required HorizontalPropertyVotingGroupLiveData? liveData,
    required List<HorizontalPropertyVotingLiveUnit> units,
    required ColorScheme colorScheme,
  }) {
    if (liveData == null && units.isEmpty) return const [];
    final totalUnits = liveData?.totalUnits ?? units.length;
    final totalCoefficient = _sumCoefficients(units);
    final votedCount = liveData?.unitsVoted ??
        units.where((unit) => unit.hasVoted).length;
    final pendingCountRaw =
        liveData?.unitsPending ?? (totalUnits - votedCount);
    final pendingCount = pendingCountRaw < 0 ? 0 : pendingCountRaw;
    final votedCoefficient =
        _sumCoefficients(units.where((unit) => unit.hasVoted));
    final pendingCoefficient =
        (totalCoefficient - votedCoefficient).clamp(0.0, double.infinity);

    return [
      _LiveSummaryData(
        label: 'Total',
        count: totalUnits,
        unitPercentage: null,
        coefficientPercentage: totalCoefficient > 0 ? 100.0 : null,
        icon: Icons.apartment_outlined,
        color: colorScheme.primary,
      ),
      _LiveSummaryData(
        label: 'Participantes',
        count: votedCount,
        unitPercentage:
            totalUnits > 0 ? _calculatePercentage(votedCount, totalUnits) : null,
        coefficientPercentage: totalCoefficient > 0
            ? _calculatePercentage(votedCoefficient, totalCoefficient)
            : null,
        icon: Icons.how_to_vote_outlined,
        color: colorScheme.secondary,
      ),
      _LiveSummaryData(
        label: 'Pendientes',
        count: pendingCount,
        unitPercentage: totalUnits > 0
            ? _calculatePercentage(pendingCount, totalUnits)
            : null,
        coefficientPercentage: totalCoefficient > 0
            ? _calculatePercentage(pendingCoefficient, totalCoefficient)
            : null,
        icon: Icons.pending_actions_outlined,
        color: colorScheme.tertiary,
      ),
    ];
  }


  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

    return FractionallySizedBox(
      heightFactor: 0.95,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child: _controller == null
                        ? _LiveErrorContent(message: _initError)
                        : Obx(() {
                            final controller = _controller!;
                            final liveData = controller.liveData.value;
                            final isConnecting = controller.isConnecting.value;
                            final error = controller.errorMessage.value;
                            final filter = controller.filter.value;
                            final units = controller.filteredUnits;
                            final allUnits = controller.liveUnits;
                            final optionSummaries = _buildOptionSummaries(
                              controller: controller,
                              liveData: liveData,
                              units: allUnits,
                              colorScheme: cs,
                            );
                            final summaryCards = _buildSummaryData(
                              liveData: liveData,
                              units: allUnits,
                              colorScheme: cs,
                            );

                            return SingleChildScrollView(
                              padding: const EdgeInsets.fromLTRB(
                                24,
                                10,
                                24,
                                24,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              widget.voting.title,
                                              style: tt.titleLarge?.copyWith(
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              widget.group.name,
                                              style: tt.bodyMedium?.copyWith(
                                                color: cs.onSurfaceVariant,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      IconButton(
                                        onPressed: () =>
                                            Navigator.of(context).maybePop(),
                                        icon: const Icon(Icons.close),
                                        tooltip: 'Cerrar',
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 20),
                                  Row(
                                    children: [
                                      _LiveStatChip(
                                        label: 'Unidades',
                                        value: liveData?.totalUnits ?? 0,
                                        icon: Icons.apartment_outlined,
                                      ),
                                      const SizedBox(width: 12),
                                      _LiveStatChip(
                                        label: 'Votaron',
                                        value: liveData?.unitsVoted ?? 0,
                                        icon: Icons.how_to_vote_outlined,
                                        color: cs.primary,
                                      ),
                                      const SizedBox(width: 12),
                                      _LiveStatChip(
                                        label: 'Pendientes',
                                        value: liveData?.unitsPending ?? 0,
                                        icon: Icons.pending_actions_outlined,
                                        color: cs.tertiary,
                                    ),
                                  ],
                                ),
                                if (optionSummaries.isNotEmpty) ...[
                                  const SizedBox(height: 20),
                                  Text(
                                    'Opciones de votación',
                                    style: tt.titleSmall?.copyWith(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      return _buildResponsiveWrap(
                                        maxWidth: constraints.maxWidth,
                                        minItemWidth: 210,
                                        items: optionSummaries
                                            .map((data) => _LiveOptionCard(data: data))
                                            .toList(),
                                      );
                                    },
                                  ),
                                ],
                                if (summaryCards.isNotEmpty) ...[
                                  const SizedBox(height: 20),
                                  Text(
                                    'Resumen',
                                    style: tt.titleSmall?.copyWith(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      return _buildResponsiveWrap(
                                        maxWidth: constraints.maxWidth,
                                        minItemWidth: 200,
                                        items: summaryCards
                                            .map((data) => _LiveSummaryCard(data: data))
                                            .toList(),
                                      );
                                    },
                                  ),
                                ],
                                if (liveData?.timestamp != null) ...[
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                        Icon(
                                          Icons.schedule_outlined,
                                          size: 18,
                                          color: cs.onSurfaceVariant,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Último evento · ${_formatLiveTimestamp(liveData!.timestamp!)}',
                                          style: tt.bodySmall?.copyWith(
                                            color: cs.onSurfaceVariant,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                  ),
                                ],
                                const SizedBox(height: 20),
                                TextField(
                                  controller: _searchCtrl,
                                  decoration: InputDecoration(
                                      labelText: 'Buscar unidad o residente',
                                      prefixIcon: const Icon(Icons.search),
                                      suffixIcon: filter.isNotEmpty
                                          ? IconButton(
                                              onPressed: () {
                                                _searchCtrl.clear();
                                                controller.clearFilter();
                                              },
                                              icon: const Icon(Icons.close),
                                            )
                                          : null,
                                      filled: true,
                                      fillColor: cs.surfaceContainerHighest,
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                    onChanged: controller.setFilter,
                                  ),
                                  const SizedBox(height: 12),
                                  FilledButton.icon(
                                    onPressed: () => _openVoteSheet(),
                                    icon: const Icon(Icons.add_outlined),
                                    label: const Text('Registrar voto'),
                                  ),
                                  const SizedBox(height: 16),
                                  if (isConnecting && liveData == null)
                                    const Center(
                                      child: Padding(
                                        padding: EdgeInsets.symmetric(
                                          vertical: 24,
                                        ),
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.6,
                                        ),
                                      ),
                                    )
                                  else if (error != null)
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        _InlineError(message: error),
                                        const SizedBox(height: 12),
                                        OutlinedButton.icon(
                                          onPressed: controller.reconnect,
                                          icon: const Icon(
                                            Icons.refresh_outlined,
                                          ),
                                          label: const Text('Reintentar'),
                                        ),
                                      ],
                                    )
                                  else if (units.isEmpty)
                                    const Text(
                                      'No hay unidades registradas en este grupo.',
                                    )
                                else
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      final items = units
                                          .map(
                                            (unit) => _UnitVoteTile(
                                              unit: unit,
                                              isProcessing: controller
                                                  .isProcessing(
                                                    unit.propertyUnitId,
                                                  ),
                                              onVote: () =>
                                                  _openVoteSheet(unit: unit),
                                              onRemove: unit.hasVoted
                                                  ? () =>
                                                        _confirmDeleteVote(unit)
                                                  : null,
                                            ),
                                          )
                                          .toList();
                                      return _buildResponsiveWrap(
                                        maxWidth: constraints.maxWidth,
                                        minItemWidth: 160,
                                        items: items,
                                      );
                                    },
                                  ),
                                ],
                              ),
                            );
                          }),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _formatLiveTimestamp(DateTime timestamp) {
    final formatter = DateFormat('dd/MM/yyyy · HH:mm:ss');
    return formatter.format(timestamp.toLocal());
  }
}

class VotingLiveController extends GetxController {
  final HorizontalPropertyVotingController parent;
  final int groupId;
  final int votingId;

  VotingLiveController({
    required this.parent,
    required this.groupId,
    required this.votingId,
  }) : _repository = parent.repository;

  final HorizontalPropertiesRepository _repository;
  StreamSubscription<HorizontalPropertyVotingGroupLiveData>? _subscription;

  final isConnecting = false.obs;
  final errorMessage = RxnString();
  final liveData = Rxn<HorizontalPropertyVotingGroupLiveData>();
  final filter = ''.obs;
  final RxSet<int> _processingUnitIds = <int>{}.obs;

  HorizontalPropertiesRepository get repository => _repository;

  @override
  void onInit() {
    super.onInit();
    Future.microtask(() async {
      if (isClosed) return;
      try {
        await Future.wait([
          parent.loadVotingOptions(
            groupId: groupId,
            votingId: votingId,
            force: true,
          ),
          parent.loadVotingVotes(
            groupId: groupId,
            votingId: votingId,
            force: true,
          ),
        ]);
      } catch (error, stackTrace) {
        debugPrint('Error preparando datos de votación en vivo: $error');
        debugPrint('Stack: $stackTrace');
      }
      if (isClosed) return;
      _subscribe();
    });
  }

  List<HorizontalPropertyVotingLiveUnit> get liveUnits =>
      liveData.value?.units ?? const [];

  List<HorizontalPropertyVotingLiveResult> get liveResults =>
      liveData.value?.results ?? const [];

  List<HorizontalPropertyVotingLiveUnit> get filteredUnits {
    final query = filter.value.trim().toLowerCase();
    final units = liveUnits;
    if (query.isEmpty) return units;
    return units
        .where((unit) {
          final unitNumber = unit.unitNumber.toLowerCase();
          final resident = unit.residentName?.toLowerCase() ?? '';
          return unitNumber.contains(query) || resident.contains(query);
        })
        .toList(growable: false);
  }

  List<HorizontalPropertyVotingOption> get options =>
      parent.optionsForVoting(groupId, votingId);

  void _subscribe() {
    isConnecting.value = true;
    errorMessage.value = null;

    _subscription?.cancel();

    final stream = _repository.subscribeToVotingLiveData(
      businessId: parent.propertyId,
      groupId: groupId,
      votingId: votingId,
    );

    _subscription = stream.listen(
      (event) {
        Future.microtask(() {
          if (isClosed) return;
          liveData.value = event;
          isConnecting.value = false;
          errorMessage.value = null;
          if (event.hasVotesSnapshot) {
            parent.syncVotesFromLive(
              groupId: groupId,
              votingId: votingId,
              votes: event.votes,
            );
          }
        });
      },
      onError: (Object error, StackTrace stackTrace) {
        debugPrint('SSE error: $error');
        debugPrint('SSE stack: $stackTrace');

        Future.microtask(() {
          if (isClosed) return;
          isConnecting.value = false;
          errorMessage.value = _describeStreamError(error);
        });
      },
      onDone: () {
        Future.microtask(() {
          if (isClosed) return;
          isConnecting.value = false;
        });
      },
      cancelOnError: false,
    );
  }

  String _describeStreamError(Object error) {
    if (error is StateError && error.message.isNotEmpty) {
      return error.message;
    }
    return 'No se pudo conectar con la transmisión en vivo.';
  }

  void setFilter(String value) {
    filter.value = value;
  }

  void clearFilter() {
    filter.value = '';
  }

  bool isProcessing(int unitId) => _processingUnitIds.contains(unitId);

  Future<void> reconnect() async {
    await _subscription?.cancel();
    _subscribe();
  }

  Future<HorizontalPropertyActionResult> castVote({
    required int propertyUnitId,
    required int optionId,
  }) async {
    if (_processingUnitIds.contains(propertyUnitId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    _processingUnitIds.add(propertyUnitId);
    try {
      final result = await parent.createVote(
        groupId: groupId,
        votingId: votingId,
        data: {
          'property_unit_id': propertyUnitId,
          'voting_option_id': optionId,
          'ip_address': 'mobile-app',
          'user_agent': 'mobile-app',
        },
      );
      return result;
    } finally {
      _processingUnitIds.remove(propertyUnitId);
    }
  }

  Future<HorizontalPropertyActionResult> removeVote({
    required int propertyUnitId,
  }) async {
    final vote = parent.voteForUnit(
      groupId: groupId,
      votingId: votingId,
      propertyUnitId: propertyUnitId,
    );
    if (vote == null) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se encontró un voto registrado para la unidad.',
      );
    }
    if (_processingUnitIds.contains(propertyUnitId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    _processingUnitIds.add(propertyUnitId);
    try {
      final result = await parent.deleteVote(
        groupId: groupId,
        votingId: votingId,
        voteId: vote.id,
      );
      return result;
    } finally {
      _processingUnitIds.remove(propertyUnitId);
    }
  }

  @override
  void onClose() {
    _subscription?.cancel();
    super.onClose();
  }
}

class _LiveErrorContent extends StatelessWidget {
  final String? message;
  const _LiveErrorContent({this.message});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    final text =
        message ??
        'No se pudo iniciar la transmisión en vivo. Inténtalo nuevamente más tarde.';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off_outlined, size: 48, color: cs.error),
            const SizedBox(height: 16),
            Text(
              'Sin conexión en vivo',
              style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              text,
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _LiveStatChip extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color? color;

  const _LiveStatChip({
    required this.label,
    required this.value,
    required this.icon,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final bg = color?.withValues(alpha: .12) ?? cs.surfaceContainerHighest;
    final fg = color ?? cs.primary;

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 6),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: fg.withValues(alpha: .3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: fg),
            const SizedBox(width: 6),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$value',
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: fg,
                  ),
                ),
                Text(
                  label,
                  style: tt.bodySmall?.copyWith(
                    color: fg.withValues(alpha: .9),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _UnitVoteTile extends StatelessWidget {
  final HorizontalPropertyVotingLiveUnit unit;
  final bool isProcessing;
  final VoidCallback onVote;
  final VoidCallback? onRemove;

  const _UnitVoteTile({
    required this.unit,
    required this.isProcessing,
    required this.onVote,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final voted = unit.hasVoted;
    final accentColor =
        voted ? (_parseHexColor(unit.optionColor) ?? cs.primary) : cs.primary;
    final background = voted
        ? accentColor.withValues(alpha: .14)
        : cs.surfaceContainerHighest;
    final borderColor = voted
        ? accentColor.withValues(alpha: .6)
        : cs.outlineVariant;
    final iconColor = voted ? accentColor : cs.primary;
    final residentName = unit.residentName?.isNotEmpty == true
        ? unit.residentName!
        : 'Sin residente';
    final optionLabel = unit.optionText?.isNotEmpty == true
        ? unit.optionText!
        : null;
    final coefficient = unit.participationCoefficient;
    final timeLabel = unit.votedAt != null
        ? DateFormat('dd/MM · HH:mm').format(unit.votedAt!.toLocal())
        : null;
    final tooltip = _unitTooltipText(unit);

    final content = AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor, width: 1.4),
        boxShadow: [
          if (voted)
            BoxShadow(
              color: accentColor.withValues(alpha: .12),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  unit.unitNumber,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),
              ),
              if (isProcessing)
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: iconColor,
                  ),
                )
              else if (voted)
                Icon(Icons.check_circle, color: iconColor, size: 20)
              else
                Icon(Icons.how_to_vote_outlined, color: iconColor, size: 20),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            residentName,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (coefficient != null) ...[
            const SizedBox(height: 4),
            Text(
              'Coef.: ${_coefficientFormatter.format(coefficient)}',
              style: theme.textTheme.labelSmall?.copyWith(
                color: cs.onSurfaceVariant.withValues(alpha: .9),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          if (optionLabel != null) ...[
            const SizedBox(height: 6),
            Text(
              optionLabel,
              style: theme.textTheme.bodySmall?.copyWith(
                color: iconColor,
                fontWeight: FontWeight.w700,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ] else ...[
            const SizedBox(height: 6),
            Text(
              'Listo para votar',
              style: theme.textTheme.bodySmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
          if (timeLabel != null) ...[
            const SizedBox(height: 4),
            Text(
              'Registrado: $timeLabel',
              style: theme.textTheme.labelSmall?.copyWith(
                color: cs.onSurfaceVariant.withValues(alpha: .75),
              ),
            ),
          ],
        ],
      ),
    );

    final stackChildren = <Widget>[content];
    if (voted && onRemove != null) {
      stackChildren.add(
        Positioned(
          top: 6,
          right: 6,
          child: IconButton(
            onPressed: isProcessing ? null : onRemove,
            icon: const Icon(Icons.close_rounded, size: 18),
            tooltip: 'Eliminar voto',
            style: IconButton.styleFrom(
              foregroundColor: cs.error,
              backgroundColor: cs.surface,
              padding: EdgeInsets.zero,
              minimumSize: const Size(28, 28),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
        ),
      );
    }

    return Tooltip(
      message: tooltip,
      preferBelow: false,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isProcessing || voted ? null : onVote,
          borderRadius: BorderRadius.circular(18),
          child: Stack(children: stackChildren),
        ),
      ),
    );
  }
}

class _LiveOptionSummaryData {
  final String label;
  final String code;
  final int count;
  final double unitPercentage;
  final double? coefficientPercentage;
  final Color accentColor;
  final bool isPending;

  const _LiveOptionSummaryData({
    required this.label,
    required this.code,
    required this.count,
    required this.unitPercentage,
    required this.coefficientPercentage,
    required this.accentColor,
    this.isPending = false,
  });
}

class _LiveSummaryData {
  final String label;
  final int count;
  final double? unitPercentage;
  final double? coefficientPercentage;
  final IconData icon;
  final Color color;

  const _LiveSummaryData({
    required this.label,
    required this.count,
    this.unitPercentage,
    this.coefficientPercentage,
    required this.icon,
    required this.color,
  });
}

class _LiveOptionCard extends StatelessWidget {
  final _LiveOptionSummaryData data;
  const _LiveOptionCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final background = data.isPending
        ? cs.surfaceContainerHighest
        : data.accentColor.withValues(alpha: .12);
    final border = data.isPending
        ? cs.outlineVariant
        : data.accentColor.withValues(alpha: .6);
    final labelColor = data.isPending ? cs.onSurface : data.accentColor;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  data.label,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: labelColor,
                  ),
                ),
              ),
              if (data.code.isNotEmpty)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: data.isPending
                        ? cs.surface
                        : data.accentColor.withValues(alpha: .16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    data.code.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: labelColor,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            '${NumberFormat.decimalPattern().format(data.count)}',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: cs.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${_formatOneDecimal(data.unitPercentage)}% del total',
            style: theme.textTheme.bodySmall?.copyWith(
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (data.coefficientPercentage != null) ...[
            const SizedBox(height: 2),
            Text(
              '${_formatOneDecimal(data.coefficientPercentage!)}% por coef.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _LiveSummaryCard extends StatelessWidget {
  final _LiveSummaryData data;
  const _LiveSummaryCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final background = data.color.withValues(alpha: .12);
    final border = data.color.withValues(alpha: .45);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 38,
            width: 38,
            decoration: BoxDecoration(
              color: data.color.withValues(alpha: .14),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(data.icon, color: data.color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  data.label,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: data.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  NumberFormat.decimalPattern().format(data.count),
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),
                if (data.unitPercentage != null)
                  Text(
                    '${_formatOneDecimal(data.unitPercentage!)}% del total',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                if (data.coefficientPercentage != null)
                  Text(
                    '${_formatOneDecimal(data.coefficientPercentage!)}% por coef.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: cs.onSurfaceVariant,
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

final NumberFormat _oneDecimalFormatter = NumberFormat('##0.0');
final NumberFormat _coefficientFormatter = NumberFormat('##0.###');

String _formatOneDecimal(double value) {
  final sanitized = value.isFinite ? value : 0.0;
  return _oneDecimalFormatter.format(sanitized);
}

double _calculatePercentage(num part, num total) {
  if (total == 0) return 0;
  final value = (part.toDouble() / total.toDouble()) * 100;
  if (!value.isFinite) return 0;
  return value.clamp(0.0, 100.0);
}

double _sumCoefficients(Iterable<HorizontalPropertyVotingLiveUnit> units) {
  return units.fold<double>(
    0,
    (sum, unit) => sum + (unit.participationCoefficient ?? 0.0),
  );
}

Color? _parseHexColor(String? value) {
  if (value == null || value.isEmpty) return null;
  final hex = value.replaceFirst('#', '');
  try {
    final color = int.parse(hex, radix: 16);
    if (hex.length == 6) {
      return Color(0xFF000000 | color);
    }
    if (hex.length == 8) {
      return Color(color);
    }
  } catch (_) {
    return null;
  }
  return null;
}

String _unitTooltipText(HorizontalPropertyVotingLiveUnit unit) {
  final buffer = StringBuffer();
  final resident = unit.residentName?.isNotEmpty == true
      ? unit.residentName!
      : 'Sin residente';
  buffer.writeln('Residente: $resident');
  final coefficient = unit.participationCoefficient;
  buffer.writeln(
    'Coeficiente: ${coefficient != null ? _coefficientFormatter.format(coefficient) : 'N/D'}',
  );
  final status = unit.hasVoted
      ? 'Votó${unit.optionText?.isNotEmpty == true ? ' · ${unit.optionText}' : ''}'
      : 'Pendiente';
  buffer.writeln('Estado: $status');
  if (unit.votedAt != null) {
    buffer.writeln(
      'Registrado: ${DateFormat('dd/MM/yyyy HH:mm').format(unit.votedAt!.toLocal())}',
    );
  }
  return buffer.toString();
}

class _VoteCreationBottomSheet extends StatefulWidget {
  final VotingLiveController controller;
  final HorizontalPropertyVotingLiveUnit? initialUnit;

  const _VoteCreationBottomSheet({required this.controller, this.initialUnit});

  @override
  State<_VoteCreationBottomSheet> createState() =>
      _VoteCreationBottomSheetState();
}

class _VoteCreationBottomSheetState extends State<_VoteCreationBottomSheet> {
  late final VotingLiveController _controller;
  late final TextEditingController _searchCtrl;
  HorizontalPropertyVotingLiveUnit? _selectedUnit;
  int? _selectedOptionId;
  bool _submitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller;
    _searchCtrl = TextEditingController();
    _selectedUnit = widget.initialUnit;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<HorizontalPropertyVotingLiveUnit> get _units {
    final query = _searchCtrl.text.trim().toLowerCase();
    final units = _controller.liveUnits;
    if (query.isEmpty) return units;
    return units
        .where((unit) {
          final unitNumber = unit.unitNumber.toLowerCase();
          final resident = unit.residentName?.toLowerCase() ?? '';
          return unitNumber.contains(query) || resident.contains(query);
        })
        .toList(growable: false);
  }

  Future<void> _handleSubmit() async {
    if (_submitting) return;
    if (_selectedUnit == null) {
      setState(() {
        _errorMessage = 'Selecciona una unidad para registrar el voto.';
      });
      return;
    }
    if (_selectedOptionId == null) {
      setState(() {
        _errorMessage = 'Selecciona una opción de votación.';
      });
      return;
    }

    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    final result = await _controller.castVote(
      propertyUnitId: _selectedUnit!.propertyUnitId,
      optionId: _selectedOptionId!,
    );

    if (!mounted) return;

    if (result.success) {
      Navigator.of(context).pop(true);
    } else {
      setState(() {
        _submitting = false;
        _errorMessage =
            result.message ??
            'No se pudo registrar el voto. Inténtalo nuevamente.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);
    final options = _controller.options;

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, viewInsets.bottom + 16),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .18),
                  blurRadius: 28,
                  offset: const Offset(0, 22),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const _SheetHandle(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Registrar voto',
                            style: tt.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Selecciona la unidad y la opción para registrar el voto.',
                            style: tt.bodyMedium?.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _searchCtrl,
                            decoration: InputDecoration(
                              labelText: 'Buscar unidad',
                              prefixIcon: const Icon(Icons.search),
                              filled: true,
                              fillColor: cs.surfaceContainerHighest,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                          const SizedBox(height: 12),
                          DecoratedBox(
                            decoration: BoxDecoration(
                              color: cs.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: cs.outlineVariant),
                            ),
                            child: ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _units.length,
                              itemBuilder: (context, index) {
                                final unit = _units[index];
                                final voted = unit.hasVoted;
                                return RadioListTile<
                                  HorizontalPropertyVotingLiveUnit
                                >(
                                  value: unit,
                                  groupValue: _selectedUnit,
                                  dense: true,
                                  onChanged: voted
                                      ? null
                                      : (value) {
                                          setState(() {
                                            _selectedUnit = value;
                                          });
                                        },
                                  title: Text(unit.unitNumber),
                                  subtitle:
                                      unit.residentName?.isNotEmpty == true
                                      ? Text(unit.residentName!)
                                      : null,
                                  secondary: voted
                                      ? const Icon(
                                          Icons.how_to_vote,
                                          color: Colors.green,
                                        )
                                      : null,
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Opciones de votación',
                            style: tt.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 12),
                          if (options.isEmpty)
                            const _InlineError(
                              message:
                                  'Aún no se han configurado opciones para esta votación.',
                            )
                          else
                            ...options.map(
                              (option) => CheckboxListTile(
                                value: _selectedOptionId == option.id,
                                onChanged: (value) {
                                  setState(() {
                                    _selectedOptionId = value == true
                                        ? option.id
                                        : null;
                                  });
                                },
                                controlAffinity:
                                    ListTileControlAffinity.leading,
                                title: Text(option.optionText),
                                subtitle: Text('Código ${option.optionCode}'),
                                secondary: option.color != null
                                    ? CircleAvatar(
                                        backgroundColor:
                                            _parseHexColor(option.color) ??
                                            cs.primary,
                                      )
                                    : null,
                              ),
                            ),
                          const SizedBox(height: 16),
                          if (_errorMessage != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _InlineError(message: _errorMessage!),
                            ),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: _submitting
                                      ? null
                                      : () => Navigator.of(context).maybePop(),
                                  child: const Text('Cancelar'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: FilledButton(
                                  onPressed: _submitting ? null : _handleSubmit,
                                  child: _submitting
                                      ? const SizedBox(
                                          height: 22,
                                          width: 22,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2.4,
                                          ),
                                        )
                                      : const Text('Confirmar voto'),
                                ),
                              ),
                            ],
                          ),
                        ],
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
}
