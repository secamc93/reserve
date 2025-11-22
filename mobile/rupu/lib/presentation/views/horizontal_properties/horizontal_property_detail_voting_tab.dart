part of 'horizontal_property_detail_view.dart';

class _VotingTab extends GetWidget<HorizontalPropertyVotingController> {
  final String controllerTag;
  const _VotingTab({required this.controllerTag});

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final groups = List<HorizontalPropertyVotingGroup>.of(controller.groups);

      return RefreshIndicator(
        color: cs.primary,
        onRefresh: controller.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            // Encabezado tipo "sección" estilo Instagram settings
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: cs.primary.withValues(alpha: .08),
                  ),
                  child: Icon(Icons.how_to_vote_outlined, color: cs.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Grupos de votación',
                        style: tt.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        groups.isEmpty
                            ? 'Sin grupos registrados'
                            : '${groups.length} grupos disponibles',
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Actualizar',
                  onPressed: controller.refresh,
                  icon: isLoading
                      ? SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.2,
                            color: cs.onSurface,
                          ),
                        )
                      : const Icon(Icons.refresh_outlined),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
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
      final name = result.group?.name ?? 'grupo de votación';
      final createdAt = result.group?.createdAt;
      final formattedTimestamp = createdAt != null
          ? DateFormat('yyyy-MM-dd – HH:mm:ss').format(createdAt.toLocal())
          : null;
      final baseMessage =
          result.message ??
          (group == null
              ? 'Grupo de votación creado'
              : 'Grupo de votación actualizado');
      final detailMessage = formattedTimestamp != null
          ? '$baseMessage · $formattedTimestamp'
          : baseMessage;
      _showSnack(
        group == null ? 'Grupo creado' : 'Grupo actualizado',
        'El $name se ${group == null ? 'creó' : 'actualizó'} correctamente.\n$detailMessage',
      );
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
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: .3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: .05),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Encabezado tipo "card" IG
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar con ligero gradiente tipo Instagram
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [cs.primary, cs.secondary],
                      ),
                    ),
                    child: Container(
                      margin: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: cs.surface,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        Icons.how_to_vote_outlined,
                        color: cs.primary,
                      ),
                    ),
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
                  Column(
                    children: [
                      _StatusChip(
                        label: labelChip,
                        background: bgChip,
                        foreground: fgChip,
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
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox.shrink(),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Información en chips compactos
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _ColoredInfoChip(
                            icon: Icons.calendar_month_outlined,
                            label:
                                'Inicio: ${_formatDate(group.votingStartDate)}',
                            color: cs.primary,
                          ),
                          _ColoredInfoChip(
                            icon: Icons.event_outlined,
                            label: 'Fin: ${_formatDate(group.votingEndDate)}',
                            color: cs.secondary,
                          ),
                          _ColoredInfoChip(
                            icon: Icons.gavel_outlined,
                            label: group.requiresQuorum
                                ? 'Requiere quórum'
                                : 'Sin quórum',
                            color: group.requiresQuorum
                                ? cs.tertiary
                                : cs.outline,
                          ),
                          if (group.quorumPercentage != null)
                            _ColoredInfoChip(
                              icon: Icons.percent_outlined,
                              label: 'Quórum: ${group.quorumPercentage}%',
                              color: cs.primary,
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _CardActions(
                        viewLabel: 'Gestión de asistencia',
                        onView: onOpenAttendance,
                        onEdit: onEdit,
                        onDelete: isDeleting
                            ? null
                            : () => _confirmDelete(context),
                        isDeleteDisabled: isDeleting,
                      ),
                      const SizedBox(height: 12),
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
                            style: FilledButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(999),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 8,
                              ),
                            ),
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
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Text(
                              'Aún no se han creado votaciones para este grupo.',
                              style: tt.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
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
    return DateFormat('dd/MM/yyyy · HH:mm').format(date.toLocal());
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
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: .3)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header voto
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
                  Column(
                    children: [
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
                ],
              ),
              if (isExpanded) ...[
                const SizedBox(height: 10),
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
                // Acciones principales
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      onPressed: voting.isActive
                          ? () => _openLiveVoting(context)
                          : null,
                      icon: const Icon(Icons.podcasts_outlined, size: 18),
                      label: const Text('Votación en vivo'),
                    ),
                    FilledButton.tonalIcon(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      onPressed: () => _openVotingForm(context),
                      icon: const Icon(Icons.edit_outlined, size: 18),
                      label: const Text('Editar'),
                    ),
                    FilledButton.tonalIcon(
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
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
                        // Opciones de votación
                        Row(
                          children: [
                            Text(
                              'Opciones de votación',
                              style: tt.titleSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const Spacer(),
                            if (optionsLoading)
                              const Padding(
                                padding: EdgeInsets.only(right: 8),
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                            IconButton(
                              tooltip: 'Actualizar opciones',
                              onPressed: optionsLoading
                                  ? null
                                  : () => _controller.loadVotingOptions(
                                      groupId: group.id,
                                      votingId: voting.id,
                                      force: true,
                                    ),
                              icon: const Icon(Icons.refresh_outlined),
                            ),
                            IconButton(
                              onPressed: () => _openOptionForm(context),
                              icon: const Icon(Icons.add_outlined),
                              tooltip: 'Agregar opción',
                            ),
                          ],
                        ),
                        if (optionsLoading)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Center(
                              child: CircularProgressIndicator(
                                strokeWidth: 2.2,
                              ),
                            ),
                          )
                        else if (optionsError != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _InlineError(message: optionsError),
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
                                  color: cs.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: cs.outlineVariant.withValues(
                                      alpha: .4,
                                    ),
                                  ),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  leading: CircleAvatar(
                                    backgroundColor:
                                        _parseColor(option.color) ?? cs.primary,
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
                        // Resultados
                        Row(
                          children: [
                            Text(
                              'Resultados de votación',
                              style: tt.titleSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const Spacer(),
                            if (votesLoading)
                              const Padding(
                                padding: EdgeInsets.only(right: 8),
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                            IconButton(
                              onPressed: votesLoading
                                  ? null
                                  : () => _controller.loadVotingVotes(
                                      groupId: group.id,
                                      votingId: voting.id,
                                      force: true,
                                    ),
                              icon: const Icon(Icons.refresh_outlined),
                              tooltip: 'Actualizar resultados',
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: cs.outlineVariant.withValues(alpha: .4),
                            ),
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
                                    final percentFormatter = NumberFormat(
                                      '##0.0#',
                                    );
                                    final int count = summary[option.id] ?? 0;
                                    final double percentage = totalVotes == 0
                                        ? 0.0
                                        : (count / totalVotes)
                                              .clamp(0.0, 1.0)
                                              .toDouble();
                                    return Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 12,
                                      ),
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
                                                '${percentFormatter.format(percentage * 100)}%',
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
                                              valueColor:
                                                  AlwaysStoppedAnimation(
                                                    _parseColor(option.color) ??
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
                                      padding: EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.2,
                                      ),
                                    ),
                                  )
                                else if (votesError != null)
                                  _InlineError(message: votesError)
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
                                            color: cs.surface,
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                            border: Border.all(
                                              color: cs.outlineVariant
                                                  .withValues(alpha: .3),
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
                                        const SizedBox(height: 10),
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

  Color? _parseColor(String? value) {
    if (value == null || value.isEmpty) return null;
    try {
      final hex = value.replaceFirst('#', '');
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
  LoginController? _loginController;
  DateTime? _startDateTime;
  DateTime? _endDateTime;
  int _quorumValue = 50;
  bool _requiresQuorum = false;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final group = widget.initialGroup;
    _nameCtrl = TextEditingController(text: group?.name ?? '');
    _descriptionCtrl = TextEditingController(text: group?.description ?? '');
    _notesCtrl = TextEditingController();
    if (Get.isRegistered<LoginController>()) {
      _loginController = Get.find<LoginController>();
    }
    _startDateTime = group?.votingStartDate?.toLocal();
    _endDateTime = group?.votingEndDate?.toLocal();
    _requiresQuorum = group?.requiresQuorum ?? false;
    final initialQuorum = group?.quorumPercentage;
    if (initialQuorum != null) {
      _quorumValue = initialQuorum.clamp(0, 100).toInt();
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descriptionCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime({required bool isStart}) async {
    final current = isStart ? _startDateTime : _endDateTime;
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

    final withTime = DateTime(
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
        _startDateTime = withTime;
      } else {
        _endDateTime = withTime;
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
      payload['quorum_percentage'] = _quorumValue;
    }
    if (_startDateTime != null) {
      payload['voting_start_date'] = _formatIsoWithOffset(_startDateTime!);
    }
    if (_endDateTime != null) {
      payload['voting_end_date'] = _formatIsoWithOffset(_endDateTime!);
    }
    final createdBy = _loginController?.sessionModel.value?.data.user.id;
    if (createdBy != null) {
      payload['created_by_user_id'] = createdBy;
    }
    return payload;
  }

  String _formatIsoWithOffset(DateTime date) {
    final local = date.toLocal();
    final nanos = local.millisecond * 1000000 + local.microsecond * 1000;
    final nanoString = nanos.toString().padLeft(9, '0');
    final base = DateFormat('yyyy-MM-dd\'T\'HH:mm:ss').format(local);
    final offset = local.timeZoneOffset;
    final sign = offset.isNegative ? '-' : '+';
    final hours = offset.inHours.abs().toString().padLeft(2, '0');
    final minutes = (offset.inMinutes.abs() % 60).toString().padLeft(2, '0');
    return '$base.$nanoString$sign$hours:$minutes';
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: cs.primary.withValues(alpha: .7),
            width: 1.2,
          ),
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
                                  if (value && _quorumValue <= 0) {
                                    _quorumValue = 50;
                                  }
                                });
                              },
                              title: const Text('Requiere quórum'),
                              contentPadding: EdgeInsets.zero,
                            ),
                            if (_requiresQuorum) ...[
                              const SizedBox(height: 12),
                              Text(
                                'Porcentaje de quórum',
                                style: tt.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Slider.adaptive(
                                value: _quorumValue.toDouble(),
                                min: 0,
                                max: 100,
                                divisions: 100,
                                label: '$_quorumValue%',
                                onChanged: (value) {
                                  setState(() {
                                    _quorumValue = value
                                        .round()
                                        .clamp(0, 100)
                                        .toInt();
                                  });
                                },
                              ),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '$_quorumValue%',
                                  style: tt.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _DateField(
                                    label: 'Fecha inicio',
                                    date: _startDateTime,
                                    onTap: () => _pickDateTime(isStart: true),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _DateField(
                                    label: 'Fecha fin',
                                    date: _endDateTime,
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
                                        : () =>
                                              Navigator.of(context).maybePop(),
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: cs.primary.withValues(alpha: .7),
            width: 1.2,
          ),
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
      final raw = ColorTools.colorCode(_selectedColor!);
      payload['color'] = raw.startsWith('#') ? raw : '#$raw';
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: cs.primary.withValues(alpha: .7),
            width: 1.2,
          ),
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
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
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
                                ColorTools.colorCode(_selectedColor!),
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

// A partir de aquí, todo lo de live, summary, chips, etc.
// NO se modifica la lógica, solo se mantienen estilos existentes.
// (Lo dejo tal cual lo compartiste, salvo que ya incluía estilos modernos.)

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
  late final FocusNode _searchFocus;

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
    _searchFocus = FocusNode();
    _searchFocus.addListener(() {
      if (!_searchFocus.hasFocus) {
        _controller?.clearResidentSuggestions();
      }
    });
  }

  @override
  void dispose() {
    if (_controller != null &&
        Get.isRegistered<VotingLiveController>(tag: _liveTag)) {
      _controller?.closeLiveStream();
      Get.delete<VotingLiveController>(tag: _liveTag);
    }
    _controller?.clearResidentSuggestions();
    _searchFocus.dispose();
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
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [cs.surfaceContainerHighest, cs.surface],
              ),
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
                            final isPriming = controller.isPriming.value;
                            final error = controller.errorMessage.value;
                            final filter = controller.filter.value;
                            final units = controller.filteredUnits;

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
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 10,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: cs.error.withValues(
                                                  alpha: .12,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(999),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
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
                                                    style: tt.labelSmall
                                                        ?.copyWith(
                                                          color: cs.error,
                                                          fontWeight:
                                                              FontWeight.w700,
                                                        ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 10),
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
                                  const SizedBox(height: 16),
                                  AnimatedSwitcher(
                                    duration: const Duration(milliseconds: 250),
                                    child: isConnecting && liveData != null
                                        ? Padding(
                                            key: const ValueKey(
                                              'live-progress',
                                            ),
                                            padding: const EdgeInsets.only(
                                              bottom: 12,
                                            ),
                                            child:
                                                const LinearProgressIndicator(
                                                  minHeight: 3,
                                                ),
                                          )
                                        : const SizedBox.shrink(),
                                  ),
                                  _LiveOptionsSummary(controller: controller),
                                  const SizedBox(height: 20),
                                  TextField(
                                    controller: _searchCtrl,
                                    focusNode: _searchFocus,
                                    decoration: InputDecoration(
                                      labelText: 'Buscar unidad o residente',
                                      prefixIcon: const Icon(Icons.search),
                                      suffixIcon: filter.isNotEmpty
                                          ? IconButton(
                                              onPressed: () {
                                                _searchCtrl.clear();
                                              },
                                              icon: const Icon(Icons.close),
                                            )
                                          : null,
                                      filled: true,
                                      fillColor: cs.surfaceContainerHighest,
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(
                                          999,
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(
                                          999,
                                        ),
                                        borderSide: BorderSide(
                                          color: cs.outlineVariant,
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(
                                          999,
                                        ),
                                        borderSide: BorderSide(
                                          color: cs.primary,
                                          width: 1.4,
                                        ),
                                      ),
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                            horizontal: 16,
                                            vertical: 10,
                                          ),
                                    ),
                                    onChanged: (value) {
                                      controller.setFilter(value);
                                      controller.searchResidents(value);
                                    },
                                  ),
                                  // DESPUÉS
                                  Builder(
                                    builder: (_) {
                                      final hasFocus = _searchFocus.hasFocus;
                                      final query = _searchCtrl.text.trim();

                                      if (!hasFocus) {
                                        return const SizedBox(height: 12);
                                      }

                                      if (query.length < 2) {
                                        return Column(
                                          children: [
                                            const SizedBox(height: 8),
                                            const SizedBox(height: 12),
                                          ],
                                        );
                                      }

                                      return Column(
                                        children: [
                                          const SizedBox(height: 8),
                                          const SizedBox(height: 12),
                                        ],
                                      );
                                    },
                                  ),

                                  FilledButton.icon(
                                    onPressed: widget.voting.isActive
                                        ? () => _openVoteSheet()
                                        : null,
                                    icon: const Icon(Icons.add_outlined),
                                    label: const Text('Registrar voto'),
                                  ),
                                  const SizedBox(height: 16),
                                  if (liveData == null &&
                                      (isPriming || isConnecting))
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
                                    Text(
                                      controller.liveUnits.isEmpty
                                          ? 'No hay unidades registradas en este grupo.'
                                          : 'Todas las unidades han registrado su voto.',
                                      style: tt.bodyMedium,
                                    )
                                  else
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: units
                                          .map(
                                            (unit) => _UnitVoteChip(
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
                                          .toList(),
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
  final isPriming = true.obs;
  final errorMessage = RxnString();
  final liveData = Rxn<HorizontalPropertyVotingGroupLiveData>();
  final filter = ''.obs;
  final RxSet<int> _processingUnitIds = <int>{}.obs;
  final residentSuggestions = <HorizontalPropertyResidentItem>[].obs;
  final residentSuggestionsLoading = false.obs;
  final totalUnitsAllowed = RxnInt();
  final allowedUnitsLoading = false.obs;

  HorizontalPropertiesRepository get repository => _repository;

  @override
  void onInit() {
    super.onInit();
    Future.microtask(() async {
      if (isClosed) return;
      try {
        await Future.wait([
          _loadAllowedUnitsCount(),
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
          _loadInitialDetails(),
        ]);
      } catch (error, stackTrace) {
        debugPrint('Error preparando datos de votación en vivo: $error');
        debugPrint('Stack: $stackTrace');
      } finally {
        if (!isClosed) {
          isPriming.value = false;
        }
      }
      if (isClosed) return;
      _subscribe();
    });
  }

  List<HorizontalPropertyVotingLiveUnit> get liveUnits =>
      liveData.value?.units ?? const [];

  List<HorizontalPropertyVotingLiveResult> get liveResults =>
      liveData.value?.results ?? const [];

  int get totalUnits {
    final provided = liveData.value?.totalUnits;
    if (provided != null && provided >= 0) {
      return provided;
    }
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.length;
    }
    final pending = liveData.value?.unitsPending;
    if (pending != null && pending >= 0) {
      final fromResults = liveResults.fold<int>(
        0,
        (sum, item) => sum + item.voteCount,
      );
      return fromResults + pending;
    }
    return 0;
  }

  int get allowedVotingUnits {
    final allowed = totalUnitsAllowed.value;
    if (allowed != null && allowed > 0) {
      return allowed;
    }
    return totalUnits;
  }

  List<HorizontalPropertyVotingLiveUnit> get pendingUnits {
    final units = liveUnits
        .where((unit) => !unit.hasVoted)
        .toList(growable: false);
    units.sort((a, b) => a.unitNumber.compareTo(b.unitNumber));
    return units;
  }

  int get unitsVoted {
    final provided = liveData.value?.unitsVoted;
    if (provided != null && provided >= 0) {
      return provided;
    }
    final votes = liveData.value?.votes;
    if (votes != null && votes.isNotEmpty) {
      return votes.length;
    }
    if (liveResults.isNotEmpty) {
      return liveResults.fold<int>(0, (sum, item) => sum + item.voteCount);
    }
    return liveUnits.where((unit) => unit.hasVoted).length;
  }

  int get unitsPending {
    final pendingFromData = liveData.value?.unitsPending;
    if (pendingFromData != null && pendingFromData >= 0) {
      return pendingFromData;
    }
    final pending = totalUnits - unitsVoted;
    return pending < 0 ? 0 : pending;
  }

  List<HorizontalPropertyVotingLiveUnit> get filteredUnits {
    final query = filter.value.trim().toLowerCase();
    final units = liveUnits;
    Iterable<HorizontalPropertyVotingLiveUnit> filtered;
    if (query.isEmpty) {
      filtered = units;
    } else {
      filtered = units.where((unit) {
        final unitNumber = unit.unitNumber.toLowerCase();
        final resident = unit.residentName?.toLowerCase() ?? '';
        return unitNumber.contains(query) || resident.contains(query);
      });
    }
    final list = filtered.toList(growable: false);
    list.sort((a, b) {
      final pendingComparison = (a.hasVoted ? 1 : 0).compareTo(
        b.hasVoted ? 1 : 0,
      );
      if (pendingComparison != 0) {
        return pendingComparison;
      }
      return a.unitNumber.compareTo(b.unitNumber);
    });
    return list;
  }

  List<HorizontalPropertyVotingOption> get options =>
      parent.optionsForVoting(groupId, votingId);

  Map<int, int> get voteSummary => parent.voteSummary(groupId, votingId);

  int get totalVotes => parent.totalVotesFor(groupId, votingId);

  int get totalVotesFromUnits {
    final votes = liveData.value?.votes;
    if (votes != null && votes.isNotEmpty) {
      return votes.length;
    }
    if (liveResults.isNotEmpty) {
      return liveResults.fold<int>(0, (sum, item) => sum + item.voteCount);
    }
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.where((unit) => unit.hasVoted).length;
    }
    return parent.totalVotesFor(groupId, votingId);
  }

  int countForOption(int optionId) {
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.where((unit) => unit.votingOptionId == optionId).length;
    }

    final votes =
        liveData.value?.votes ?? const <HorizontalPropertyVotingVote>[];
    if (votes.isNotEmpty) {
      return votes.where((vote) => vote.votingOptionId == optionId).length;
    }

    for (final result in liveResults) {
      if (result.votingOptionId == optionId) {
        return result.voteCount;
      }
    }
    return voteSummary[optionId] ?? 0;
  }

  HorizontalPropertyVotingOption? optionByCode(String code) {
    if (code.isEmpty) return null;
    final normalized = code.trim().toLowerCase();
    return options.firstWhereOrNull(
      (option) =>
          option.optionCode.toLowerCase() == normalized ||
          option.optionText.trim().toLowerCase() == normalized,
    );
  }

  int countForOptionCode(String code) {
    final option = optionByCode(code);
    if (option == null) return 0;
    return countForOption(option.id);
  }

  double get totalCoefficient => liveUnits.fold<double>(
    0,
    (value, unit) => value + (unit.participationCoefficient ?? 0.0),
  );

  double coefficientForOption(int optionId) {
    final units = liveUnits;
    if (units.isEmpty) return 0;
    return units
        .where((unit) => unit.votingOptionId == optionId)
        .fold<double>(
          0,
          (value, unit) => value + (unit.participationCoefficient ?? 0.0),
        );
  }

  double get votedCoefficient => liveUnits.fold<double>(
    0,
    (value, unit) =>
        unit.hasVoted ? value + (unit.participationCoefficient ?? 0.0) : value,
  );

  double get pendingCoefficient => totalCoefficient - votedCoefficient;

  HorizontalPropertyVotingLiveResult? resultForOption(int optionId) {
    for (final result in liveResults) {
      if (result.votingOptionId == optionId) {
        return result;
      }
    }
    return null;
  }

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
          _ingestLiveEvent(event);
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

  void _ingestLiveEvent(HorizontalPropertyVotingGroupLiveData event) {
    final previous = liveData.value;

    final eventName = event.eventName?.toLowerCase();
    final isDeleteEvent = eventName == 'vote_deleted';

    final previousResultsById = {
      for (final result
          in previous?.results ?? const <HorizontalPropertyVotingLiveResult>[])
        result.votingOptionId: result,
    };

    final previousVotes =
        previous?.votes ?? const <HorizontalPropertyVotingVote>[];
    final previousVotesByUnit = {
      for (final vote in previousVotes) vote.propertyUnitId: vote,
    };
    final previousVotesById = {for (final vote in previousVotes) vote.id: vote};

    var mergedUnits = event.hasUnitsSnapshot
        ? event.units
        : _mergeUnits(previous?.units ?? const [], event.units);

    var mergedResults = event.hasResultsSnapshot
        ? event.results
        : _mergeResults(previous?.results ?? const [], event.results);

    final List<HorizontalPropertyVotingVote> incomingVotes =
        isDeleteEvent && !event.hasVotesSnapshot
        ? const <HorizontalPropertyVotingVote>[]
        : event.votes;

    var mergedVotes = event.hasVotesSnapshot
        ? incomingVotes
        : _mergeVotes(previousVotes, incomingVotes);

    HorizontalPropertyVotingVote? deletedVote;
    if (isDeleteEvent) {
      if (event.votes.isNotEmpty) {
        deletedVote = event.votes.last;
      } else if (event.removedVoteId != null) {
        deletedVote = previousVotesById[event.removedVoteId!];
      } else if (event.removedVoteVotingId != null) {
        for (var i = mergedVotes.length - 1; i >= 0; i--) {
          final candidate = mergedVotes[i];
          if (candidate.votingOptionId == event.removedVoteVotingId) {
            deletedVote = candidate;
            break;
          }
        }
      }
    }

    if (event.removedVoteId != null) {
      mergedVotes = mergedVotes
          .where((vote) => vote.id != event.removedVoteId)
          .toList(growable: false);
    } else if (deletedVote != null) {
      final removedUnitId = deletedVote.propertyUnitId;
      mergedVotes = mergedVotes
          .where((vote) => vote.propertyUnitId != removedUnitId)
          .toList(growable: false);
    }

    final incomingResultsById = {
      for (final result in event.results) result.votingOptionId: result,
    };

    final bool shouldAdjustResults =
        !event.hasResultsSnapshot && event.results.isEmpty;

    if (!isDeleteEvent && !event.hasVotesSnapshot && incomingVotes.isNotEmpty) {
      final removedUnitIds = <int>{};
      for (final vote in incomingVotes) {
        final previousVote = previousVotesByUnit[vote.propertyUnitId];
        if (previousVote == null) continue;
        if (previousVote.id == vote.id) continue;

        final sameOption = previousVote.votingOptionId == vote.votingOptionId;
        final previousCount =
            previousResultsById[previousVote.votingOptionId]?.voteCount;
        final newCount = incomingResultsById[vote.votingOptionId]?.voteCount;
        final countsDecreased =
            previousCount != null &&
            newCount != null &&
            newCount < previousCount;
        final pendingIncreased = () {
          final previousPending = previous?.unitsPending;
          final nextPending = event.unitsPending;
          if (previousPending == null ||
              previousPending < 0 ||
              nextPending < 0) {
            return false;
          }
          return nextPending > previousPending;
        }();

        if ((sameOption && (countsDecreased || pendingIncreased)) ||
            (!sameOption && countsDecreased)) {
          removedUnitIds.add(vote.propertyUnitId);
        }
      }
      if (removedUnitIds.isNotEmpty) {
        mergedVotes = mergedVotes
            .where((vote) => !removedUnitIds.contains(vote.propertyUnitId))
            .toList(growable: false);
      }
    }

    if (shouldAdjustResults) {
      if (!isDeleteEvent &&
          !event.hasVotesSnapshot &&
          incomingVotes.isNotEmpty) {
        for (final vote in incomingVotes) {
          mergedResults = _applyVoteDeltaToResults(
            mergedResults,
            vote.votingOptionId,
            1,
          );
        }
      } else if (isDeleteEvent && deletedVote != null) {
        mergedResults = _applyVoteDeltaToResults(
          mergedResults,
          deletedVote.votingOptionId,
          -1,
        );
      }
    }

    final votesByUnit = <int, HorizontalPropertyVotingVote>{};
    for (final vote in mergedVotes) {
      votesByUnit[vote.propertyUnitId] = vote;
    }

    final optionsById = {
      for (final option in parent.optionsForVoting(groupId, votingId))
        option.id: option,
    };

    mergedUnits = mergedUnits
        .map((unit) {
          final vote = votesByUnit[unit.propertyUnitId];
          if (vote != null) {
            final option = optionsById[vote.votingOptionId];
            return unit.copyWith(
              hasVoted: true,
              votingOptionId: vote.votingOptionId,
              optionText: option?.optionText ?? unit.optionText,
              optionCode: option?.optionCode ?? unit.optionCode,
              optionColor: option?.color ?? unit.optionColor,
              votedAt: vote.votedAt ?? unit.votedAt,
            );
          }
          return unit.copyWith(
            hasVoted: false,
            votingOptionId: null,
            optionText: null,
            optionCode: null,
            optionColor: null,
            votedAt: null,
          );
        })
        .toList(growable: false);

    final providedUnits = event.hasUnitsSnapshot || event.units.isNotEmpty;

    var computedUnitsVoted = () {
      if (votesByUnit.isNotEmpty) {
        return votesByUnit.length;
      }
      if (event.unitsVoted >= 0) {
        return event.unitsVoted;
      }
      return previous?.unitsVoted ?? 0;
    }();

    if (event.unitsVoted < 0) {
      if (!isDeleteEvent &&
          !event.hasVotesSnapshot &&
          incomingVotes.isNotEmpty) {
        computedUnitsVoted += incomingVotes.length;
      } else if (isDeleteEvent && deletedVote != null) {
        computedUnitsVoted = math.max(0, computedUnitsVoted - 1);
      }
    }

    final computedTotalUnits = () {
      if (providedUnits) {
        if (event.totalUnits >= 0) {
          return event.totalUnits;
        }
        if (mergedUnits.isNotEmpty) {
          return mergedUnits.length;
        }
      }
      if (event.totalUnits >= 0) {
        return event.totalUnits;
      }
      return previous?.totalUnits ?? mergedUnits.length;
    }();

    final computedPending = () {
      if (event.unitsPending >= 0) {
        return event.unitsPending;
      }
      final pending = computedTotalUnits - computedUnitsVoted;
      return pending < 0 ? 0 : pending;
    }();

    final timestamp = event.timestamp ?? DateTime.now();

    liveData.value = HorizontalPropertyVotingGroupLiveData(
      totalUnits: computedTotalUnits,
      unitsPending: computedPending,
      unitsVoted: computedUnitsVoted,
      units: mergedUnits,
      results: mergedResults,
      votes: mergedVotes,
      hasResultsSnapshot: event.hasResultsSnapshot,
      hasVotesSnapshot: event.hasVotesSnapshot,
      hasUnitsSnapshot: event.hasUnitsSnapshot,
      timestamp: timestamp,
      eventName: event.eventName,
    );

    if (totalUnitsAllowed.value == null && computedTotalUnits > 0) {
      totalUnitsAllowed.value = computedTotalUnits;
    }

    parent.syncVotesFromLive(
      groupId: groupId,
      votingId: votingId,
      votes: mergedVotes,
    );
  }

  List<HorizontalPropertyVotingLiveUnit> _mergeUnits(
    List<HorizontalPropertyVotingLiveUnit> base,
    List<HorizontalPropertyVotingLiveUnit> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingLiveUnit>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final unit in base) unit.propertyUnitId: unit};
    final order = List<int>.of(map.keys);

    for (final unit in updates) {
      if (!map.containsKey(unit.propertyUnitId)) {
        order.add(unit.propertyUnitId);
      }
      map[unit.propertyUnitId] = unit;
    }

    return [for (final id in order) map[id]!];
  }

  List<HorizontalPropertyVotingLiveResult> _mergeResults(
    List<HorizontalPropertyVotingLiveResult> base,
    List<HorizontalPropertyVotingLiveResult> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingLiveResult>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final result in base) result.votingOptionId: result};
    for (final result in updates) {
      map[result.votingOptionId] = result;
    }
    return map.values.toList(growable: false);
  }

  List<HorizontalPropertyVotingLiveResult> _applyVoteDeltaToResults(
    List<HorizontalPropertyVotingLiveResult> base,
    int optionId,
    int delta,
  ) {
    if (delta == 0) return base;

    final map = {for (final result in base) result.votingOptionId: result};
    final existing = map[optionId];
    final option = parent.optionById(
      groupId: groupId,
      votingId: votingId,
      optionId: optionId,
    );

    final nextCount = math.max(0, (existing?.voteCount ?? 0) + delta);

    map[optionId] = HorizontalPropertyVotingLiveResult(
      votingOptionId: optionId,
      optionText: existing?.optionText ?? option?.optionText ?? '',
      optionCode: existing?.optionCode ?? option?.optionCode ?? '',
      color: existing?.color ?? option?.color,
      voteCount: nextCount,
      percentage: existing?.percentage ?? 0,
    );

    return map.values.toList(growable: false);
  }

  List<HorizontalPropertyVotingVote> _mergeVotes(
    List<HorizontalPropertyVotingVote> base,
    List<HorizontalPropertyVotingVote> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingVote>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final vote in base) vote.id: vote};
    for (final vote in updates) {
      map[vote.id] = vote;
    }
    final merged = map.values.toList(growable: false);
    merged.sort((a, b) => a.id.compareTo(b.id));
    return merged;
  }

  Future<void> _loadAllowedUnitsCount() async {
    if (allowedUnitsLoading.value) return;
    allowedUnitsLoading.value = true;
    try {
      final result = await _repository.getHorizontalPropertyUnits(
        id: parent.propertyId,
        query: {
          'page_size': 1,
          if (parent.propertyId > 0) 'business_id': parent.propertyId,
        },
      );
      if (result.totalUnits > 0) {
        totalUnitsAllowed.value = result.totalUnits;
      }
    } catch (_) {
      // no-op
    } finally {
      allowedUnitsLoading.value = false;
    }
  }

  Future<void> _loadInitialDetails() async {
    try {
      final result = await _repository.getHorizontalPropertyVotingDetails(
        businessId: parent.propertyId,
        groupId: groupId,
        votingId: votingId,
      );
      if (isClosed) return;
      if (!result.success && result.units.isEmpty) {
        return;
      }
      final current = liveData.value;
      liveData.value = HorizontalPropertyVotingGroupLiveData(
        totalUnits: result.totalUnits,
        unitsPending: result.unitsPending,
        unitsVoted: result.unitsVoted,
        units: result.units,
        results: current?.results ?? const [],
        votes: current?.votes ?? const [],
        hasResultsSnapshot: current?.hasResultsSnapshot ?? false,
        hasVotesSnapshot: current?.hasVotesSnapshot ?? false,
        hasUnitsSnapshot: true,
        timestamp: DateTime.now(),
        eventName: current?.eventName,
      );
    } catch (error, stackTrace) {
      debugPrint('Error obteniendo detalles de votación: $error');
      debugPrint('Stack: $stackTrace');
    }
  }

  Future<void> refreshUnitsSnapshot({bool refreshVotes = false}) async {
    await _loadInitialDetails();
    if (!refreshVotes || isClosed) return;
    try {
      await parent.loadVotingVotes(
        groupId: groupId,
        votingId: votingId,
        force: true,
      );
    } catch (error, stackTrace) {
      debugPrint('Error refrescando votos en vivo: $error');
      debugPrint('Stack: $stackTrace');
    }
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
    if (liveData.value == null) {
      isPriming.value = true;
    }
    _subscribe();
  }

  Future<void> searchResidents(String query) async {
    final trimmed = query.trim();
    if (trimmed.length < 2) {
      residentSuggestions.clear();
      residentSuggestionsLoading.value = false;
      return;
    }
    residentSuggestionsLoading.value = true;
    try {
      final result = await repository.getHorizontalPropertyResidents(
        id: parent.propertyId,
        query: {'search': trimmed, 'page': '1', 'page_size': '8'},
      );
      residentSuggestions.assignAll(result.residents);
    } catch (error, stackTrace) {
      debugPrint('Error buscando residentes: $error');
      debugPrint('Stack: $stackTrace');
      residentSuggestions.clear();
    } finally {
      residentSuggestionsLoading.value = false;
    }
  }

  void clearResidentSuggestions() {
    residentSuggestions.clear();
    residentSuggestionsLoading.value = false;
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
    closeLiveStream();
    super.onClose();
  }

  void closeLiveStream() {
    _subscription?.cancel();
    _subscription = null;
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

Color? _tryParseHexColor(String? value) {
  if (value == null || value.isEmpty) return null;
  try {
    final hex = value.replaceFirst('#', '');
    final colorValue = int.parse(hex, radix: 16);
    if (hex.length == 6) {
      return Color(0xFF000000 | colorValue);
    }
    if (hex.length == 8) {
      return Color(colorValue);
    }
  } catch (_) {
    return null;
  }
  return null;
}

class LiveSuggestionCard extends StatelessWidget {
  final bool loading;
  final String emptyLabel;
  final List<Widget> children;

  const LiveSuggestionCard({
    required this.loading,
    required this.emptyLabel,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    if (loading) {
      return DecoratedBox(
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: const Padding(
          padding: EdgeInsets.symmetric(vertical: 18),
          child: Center(
            child: SizedBox(
              height: 22,
              width: 22,
              child: CircularProgressIndicator(strokeWidth: 2.4),
            ),
          ),
        ),
      );
    }

    if (children.isEmpty) {
      return DecoratedBox(
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Text(
            emptyLabel,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
          ),
        ),
      );
    }

    final childrenWithDividers = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      childrenWithDividers.add(children[i]);
      if (i != children.length - 1) {
        childrenWithDividers.add(
          Divider(height: 1, thickness: 1, color: cs.outlineVariant),
        );
      }
    }

    return DecoratedBox(
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: childrenWithDividers,
      ),
    );
  }
}

class _LiveOptionsSummary extends StatelessWidget {
  final VotingLiveController controller;

  const _LiveOptionsSummary({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final _ = controller.liveData.value;
      final optionsPanel = _LiveOptionsBoard(controller: controller);
      final summaryCard = _LiveSummaryCard(controller: controller);

      return LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 720;
          if (isWide) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: optionsPanel),
                const SizedBox(width: 16),
                SizedBox(width: 280, child: summaryCard),
              ],
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [optionsPanel, const SizedBox(height: 16), summaryCard],
          );
        },
      );
    });
  }
}

class _LiveOptionsBoard extends StatelessWidget {
  final VotingLiveController controller;

  const _LiveOptionsBoard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final _ = controller.liveData.value;
      final options = controller.options;
      final tt = Theme.of(context).textTheme;
      final cs = Theme.of(context).colorScheme;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Opciones de votación',
            style: tt.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          if (options.isEmpty)
            Text(
              'Aún no se han configurado opciones para esta votación.',
              style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: options
                    .map(
                      (option) => Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: _LiveOptionCardWidget(
                          controller: controller,
                          option: option,
                        ),
                      ),
                    )
                    .toList(growable: false),
              ),
            ),
          const SizedBox(height: 16),
          _PendingVoteSummaryCard(controller: controller),
        ],
      );
    });
  }
}

class _LiveOptionCardWidget extends StatelessWidget {
  final VotingLiveController controller;
  final HorizontalPropertyVotingOption option;

  const _LiveOptionCardWidget({required this.controller, required this.option});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final percentFormat = NumberFormat('##0.0#');
      final coefficientFormat = NumberFormat('##0.0#');

      final result = controller.resultForOption(option.id);
      final count = controller.countForOption(option.id);
      final totalVotes = controller.unitsVoted;
      final votePercent = totalVotes == 0
          ? 0.0
          : (count / totalVotes).clamp(0.0, 1.0) * 100;

      final coefficientValue = controller.coefficientForOption(option.id);
      final totalCoefficient = controller.totalCoefficient;
      final coefficientPercent = totalCoefficient <= 0
          ? 0.0
          : (coefficientValue / totalCoefficient) * 100;

      final color =
          _tryParseHexColor(result?.color ?? option.color) ?? cs.primary;

      return Container(
        width: 170, // más angosta para que quepan más opciones
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: .06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: .35)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            /// Encabezado: punto de color + texto opción
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    option.optionText,
                    style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            /// Fila principal: votos + porcentaje
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$count',
                        style: tt.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        'voto${count == 1 ? '' : 's'}',
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${percentFormat.format(votePercent)}%',
                      style: tt.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'participación',
                      style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 6),

            /// Barra de progreso compacta
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: (votePercent / 100).clamp(0.0, 1.0),
                minHeight: 4,
                backgroundColor: cs.surfaceContainerHighest,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),

            const SizedBox(height: 6),

            /// Coeficiente (también compacto)
            if (totalCoefficient > 0)
              Row(
                children: [
                  Icon(
                    Icons.scale_outlined,
                    size: 14,
                    color: cs.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${coefficientFormat.format(coefficientValue)} pts',
                      style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '${percentFormat.format(coefficientPercent)}%',
                    style: tt.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
          ],
        ),
      );
    });
  }
}

class ResidentLookupTile extends StatelessWidget {
  final HorizontalPropertyResidentItem resident;
  final VoidCallback onTap;

  const ResidentLookupTile({required this.resident, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      resident.name,
                      style: tt.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      resident.propertyUnitNumber,
                      style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              if (resident.isMainResident)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: .12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'Principal',
                    style: tt.labelSmall?.copyWith(color: cs.primary),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class PendingUnitSuggestionTile extends StatelessWidget {
  final HorizontalPropertyVotingLiveUnit unit;
  final VoidCallback onTap;

  const PendingUnitSuggestionTile({required this.unit, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      unit.unitNumber,
                      style: tt.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (unit.residentName?.isNotEmpty == true) ...[
                      const SizedBox(height: 4),
                      Text(
                        unit.residentName!,
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(Icons.pending_actions_outlined, color: cs.primary),
            ],
          ),
        ),
      ),
    );
  }
}

class _PendingVoteSummaryCard extends StatelessWidget {
  final VotingLiveController controller;

  const _PendingVoteSummaryCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final allowed = controller.allowedVotingUnits;
      final trackedTotal = math.min(allowed, controller.totalVotesFromUnits);
      final pending = math.max(0, allowed - trackedTotal);

      double percent(int value) {
        if (allowed <= 0) return 0;
        return (value / allowed) * 100;
      }

      final cs = Theme.of(context).colorScheme;

      return DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              cs.tertiary.withValues(alpha: .08),
              cs.surfaceContainerHighest,
            ],
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: cs.tertiary.withValues(alpha: .4)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Votos por decisión',
                style: tt.titleSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const SizedBox(width: 12),
                  Expanded(
                    child: _DecisionCompactCard(
                      label: 'Pendientes',
                      value: pending,
                      percent: percent(pending),
                      color: cs.tertiary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _SummaryMetricLine(
                label: 'Total permitido a votar',
                value: countFormat(allowed),
                caption: 'Unidades registradas',
                trailing: '',
              ),
            ],
          ),
        ),
      );
    });
  }

  String countFormat(int value) => NumberFormat('#,##0').format(value);
}

class _DecisionCompactCard extends StatelessWidget {
  final String label;
  final int value;
  final double percent;
  final Color color;

  const _DecisionCompactCard({
    required this.label,
    required this.value,
    required this.percent,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    final countFormat = NumberFormat('#,##0');
    final percentFormat = NumberFormat('##0.0#');

    final normalized = (percent.isNaN ? 0.0 : percent).clamp(0.0, 100.0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .06),
        borderRadius: BorderRadius.circular(999), // pill style
        border: Border.all(color: color.withValues(alpha: .35)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Punto de color
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              // Etiqueta (izquierda)
              Expanded(
                child: Text(
                  label,
                  style: tt.labelSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              // Valor + porcentaje (derecha)
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    countFormat.format(value),
                    style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '${percentFormat.format(normalized)}%',
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          // Barra de progreso súper compacta
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: (normalized / 100.0),
              minHeight: 4,
              backgroundColor: cs.surfaceContainerHighest,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}

class LiveOptionStat extends StatelessWidget {
  final String label;
  final String value;
  final String? caption;

  const LiveOptionStat({
    required this.label,
    required this.value,
    this.caption,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
              if (caption != null) ...[
                const SizedBox(height: 2),
                Text(
                  caption!,
                  style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
              ],
            ],
          ),
        ),
        Text(
          value,
          style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

class SummaryChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String? caption;
  final String? trailing;
  final Color? highlightColor;

  const SummaryChip({
    required this.icon,
    required this.label,
    required this.value,
    this.caption,
    this.trailing,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final color = highlightColor ?? cs.onSurfaceVariant;

    return InputChip(
      // Estilo tipo “stats chip”
      backgroundColor: cs.surface,
      selectedColor: cs.surfaceContainerHighest,
      showCheckmark: false,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      shape: StadiumBorder(
        side: BorderSide(color: color.withValues(alpha: .35)),
      ),
      avatar: Icon(icon, size: 18, color: color),
      label: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Primera línea: label + trailing (porcentaje)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  label,
                  style: tt.labelSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: 6),
                Text(
                  trailing!,
                  style: tt.labelSmall?.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 2),
          // Valor principal
          Text(
            value,
            style: tt.bodyMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: cs.onSurface,
            ),
          ),
          if (caption != null) ...[
            const SizedBox(height: 1),
            Text(
              caption!,
              style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
            ),
          ],
        ],
      ),
    );
  }
}

class _SummaryMetricTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String? caption;
  final Color accentColor;
  final bool compact;

  const _SummaryMetricTile({
    required this.icon,
    required this.label,
    required this.value,
    this.caption,
    required this.accentColor,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: compact ? 8 : 12),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: .7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: .6)),
      ),
      child: Row(
        children: [
          Container(
            width: compact ? 26 : 30,
            height: compact ? 26 : 30,
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: .14),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Icon(icon, size: compact ? 16 : 18, color: accentColor),
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
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: tt.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),
                if (caption != null) ...[
                  const SizedBox(height: 1),
                  Text(
                    caption!,
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveSummaryCard extends StatelessWidget {
  final VotingLiveController controller;

  const _LiveSummaryCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final countFormat = NumberFormat('#,##0');
      final percentFormat = NumberFormat('##0.0#');
      final coefficientFormat = NumberFormat('##0.###');

      final allowedUnits = controller.allowedVotingUnits;
      final totalUnits = controller.totalUnits;
      final votedUnits = controller.unitsVoted;
      final pendingUnits = controller.unitsPending;
      final totalVotes = controller.totalVotesFromUnits;

      final votePercent = totalUnits == 0
          ? 0.0
          : (votedUnits / totalUnits) * 100;
      final pendingPercent = totalUnits == 0
          ? 0.0
          : (pendingUnits / totalUnits) * 100;

      final totalCoefficient = controller.totalCoefficient;
      final votedCoefficient = controller.votedCoefficient;
      final pendingCoefficient = controller.pendingCoefficient < 0
          ? 0.0
          : controller.pendingCoefficient;
      final votedCoefPercent = totalCoefficient <= 0
          ? 0.0
          : (votedCoefficient / totalCoefficient) * 100;
      final pendingCoefPercent = totalCoefficient <= 0
          ? 0.0
          : (pendingCoefficient / totalCoefficient) * 100;

      // Estado visual de la votación (solo UI)
      String statusLabel;
      Color statusColor;
      if (totalUnits == 0) {
        statusLabel = 'Sin datos';
        statusColor = cs.outline;
      } else if (votedUnits == 0) {
        statusLabel = 'Pendiente';
        statusColor = cs.tertiary;
      } else if (pendingUnits == 0) {
        statusLabel = 'Completada';
        statusColor = cs.primary;
      } else {
        statusLabel = 'En curso';
        statusColor = cs.primary;
      }

      return DecoratedBox(
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: .5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: .06),
              blurRadius: 16,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Resumen de la votación',
                          style: tt.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Vista rápida del estado general.',
                          style: tt.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: .12),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.fiber_manual_record,
                          size: 10,
                          color: statusColor,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          statusLabel,
                          style: tt.labelSmall?.copyWith(
                            color: statusColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Bloque principal: unidades
              _SummaryMetricTile(
                icon: Icons.verified_user_outlined,
                label: 'Unidades autorizadas',
                value: countFormat.format(allowedUnits),
                caption: 'Pueden votar',
                accentColor: cs.primary,
              ),

              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: _SummaryMetricTile(
                      icon: Icons.how_to_vote_outlined,
                      label: 'Votaron',
                      value: countFormat.format(votedUnits),
                      caption: '${percentFormat.format(votePercent)}%',
                      accentColor: cs.primary,
                      compact: true,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _SummaryMetricTile(
                      icon: Icons.pending_actions_outlined,
                      label: 'Pendientes',
                      value: countFormat.format(pendingUnits),
                      caption: '${percentFormat.format(pendingPercent)}%',
                      accentColor: cs.tertiary,
                      compact: true,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              _SummaryMetricTile(
                icon: Icons.assignment_turned_in_outlined,
                label: 'Registros de voto',
                value: countFormat.format(totalVotes),
                caption: 'Votos emitidos',
                accentColor: cs.secondary,
                compact: true,
              ),

              const SizedBox(height: 16),
              Divider(
                height: 1,
                color: cs.outlineVariant.withValues(alpha: .5),
              ),
              const SizedBox(height: 12),

              Text(
                'Coeficiente de participación',
                style: tt.labelSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: cs.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 8),

              _SummaryMetricTile(
                icon: Icons.scale_outlined,
                label: 'Total',
                value: coefficientFormat.format(totalCoefficient),
                caption: totalCoefficient <= 0 ? 'Sin coeficiente' : '100%',
                accentColor: cs.outline,
                compact: true,
              ),
              const SizedBox(height: 8),
              _SummaryMetricTile(
                icon: Icons.trending_up_outlined,
                label: 'Votado',
                value: coefficientFormat.format(votedCoefficient),
                caption: totalCoefficient <= 0
                    ? null
                    : '${percentFormat.format(votedCoefPercent)}%',
                accentColor: cs.primary,
                compact: true,
              ),
              const SizedBox(height: 8),
              _SummaryMetricTile(
                icon: Icons.hourglass_bottom_outlined,
                label: 'Pendiente',
                value: coefficientFormat.format(pendingCoefficient),
                caption: totalCoefficient <= 0
                    ? null
                    : '${percentFormat.format(pendingCoefPercent)}%',
                accentColor: cs.tertiary,
                compact: true,
              ),
            ],
          ),
        ),
      );
    });
  }
}

class _SummaryMetricLine extends StatelessWidget {
  final String label;
  final String value;
  final String? caption;
  final String trailing;

  const _SummaryMetricLine({
    required this.label,
    required this.value,
    this.caption,
    required this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
              if (caption != null) ...[
                const SizedBox(height: 2),
                Text(
                  caption!,
                  style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
              ],
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              value,
              style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
            ),
            ...[
              const SizedBox(height: 2),
              Text(
                trailing,
                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _UnitVoteChip extends StatefulWidget {
  final HorizontalPropertyVotingLiveUnit unit;
  final bool isProcessing;
  final VoidCallback onVote;
  final VoidCallback? onRemove;

  const _UnitVoteChip({
    required this.unit,
    required this.isProcessing,
    required this.onVote,
    this.onRemove,
  });

  @override
  State<_UnitVoteChip> createState() => _UnitVoteChipState();
}

class _UnitVoteChipState extends State<_UnitVoteChip> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final voted = widget.unit.hasVoted;
    final baseColor =
        _tryParseHexColor(widget.unit.optionColor) ?? cs.primaryContainer;

    final background = voted ? baseColor : cs.surface;
    final borderColor = voted
        ? baseColor.withValues(alpha: .5)
        : cs.outlineVariant.withValues(alpha: .9);

    final brightness = ThemeData.estimateBrightnessForColor(background);
    final foreground = brightness == Brightness.dark
        ? Colors.white
        : cs.onSurface;

    // Texto para tooltip (igual que antes pero mostrado como detalle “oculto”
    final buffer = StringBuffer(widget.unit.unitNumber);
    if (widget.unit.residentName?.isNotEmpty == true) {
      buffer.writeln('\nResidente: ${widget.unit.residentName}');
    }
    if (widget.unit.participationCoefficient != null) {
      final coefficient = NumberFormat(
        '##0.###',
      ).format(widget.unit.participationCoefficient);
      buffer.writeln('Coeficiente: $coefficient');
    }
    if (voted) {
      final option =
          widget.unit.optionText ?? widget.unit.optionCode ?? 'Registrado';
      buffer.writeln('Estado: Voto registrado ($option)');
      if (widget.unit.votedAt != null) {
        buffer.writeln(
          'Registrado: ${DateFormat('dd/MM/yyyy HH:mm').format(widget.unit.votedAt!.toLocal())}',
        );
      }
    } else {
      buffer.writeln('Estado: Pendiente de votar');
    }

    return Tooltip(
      message: buffer.toString(),
      waitDuration: const Duration(milliseconds: 400),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        width: 160,
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor),
          boxShadow: voted && _expanded
              ? [
                  BoxShadow(
                    color: baseColor.withValues(alpha: .28),
                    blurRadius: 18,
                    offset: const Offset(0, 10),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: .04),
                    blurRadius: 10,
                    offset: const Offset(0, 6),
                  ),
                ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: () {
              setState(() {
                _expanded = !_expanded;
              });
            },
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header compacta
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              widget.unit.unitNumber,
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                color: foreground,
                                fontSize: 15,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (widget.isProcessing)
                            SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: foreground,
                              ),
                            )
                          else
                            Icon(
                              _expanded ? Icons.expand_less : Icons.expand_more,
                              size: 18,
                              color: foreground.withValues(alpha: .8),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Estado tipo “pill” (como badge de historia / live)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: voted
                                  ? foreground.withValues(alpha: .12)
                                  : cs.surfaceContainerHighest.withValues(
                                      alpha: .8,
                                    ),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  voted
                                      ? Icons.how_to_vote
                                      : Icons.pending_actions_outlined,
                                  size: 14,
                                  color: voted ? foreground : cs.onSurface,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  voted
                                      ? (widget.unit.optionText ??
                                            'Voto registrado')
                                      : 'Pendiente',
                                  style: tt.labelSmall?.copyWith(
                                    color: voted ? foreground : cs.onSurface,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // Contenido desplegable
                      AnimatedCrossFade(
                        firstChild: const SizedBox.shrink(),
                        secondChild: Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (widget.unit.residentName?.isNotEmpty == true)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 2),
                                  child: Text(
                                    widget.unit.residentName!,
                                    style: tt.bodySmall?.copyWith(
                                      color: foreground.withValues(alpha: .85),
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              if (widget.unit.participationCoefficient != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 2),
                                  child: Text(
                                    'Coeficiente: ${NumberFormat('##0.###').format(widget.unit.participationCoefficient)}',
                                    style: tt.bodySmall?.copyWith(
                                      color: foreground.withValues(alpha: .8),
                                    ),
                                  ),
                                ),
                              if (voted && widget.unit.votedAt != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Text(
                                    'Registrado: ${DateFormat('dd/MM/yyyy HH:mm').format(widget.unit.votedAt!.toLocal())}',
                                    style: tt.bodySmall?.copyWith(
                                      color: foreground.withValues(alpha: .8),
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  if (!voted)
                                    Expanded(
                                      child: FilledButton.tonal(
                                        style: FilledButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 6,
                                          ),
                                          backgroundColor: foreground
                                              .withValues(alpha: .08),
                                        ),
                                        onPressed: widget.isProcessing
                                            ? null
                                            : widget.onVote,
                                        child: Text(
                                          'Registrar voto',
                                          style: tt.labelSmall?.copyWith(
                                            color: foreground,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    )
                                  else
                                    Expanded(
                                      child: OutlinedButton(
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 6,
                                          ),
                                          side: BorderSide(
                                            color: foreground.withValues(
                                              alpha: .6,
                                            ),
                                          ),
                                        ),
                                        onPressed: widget.isProcessing
                                            ? null
                                            : widget.onVote,
                                        child: Text(
                                          'Cambiar voto',
                                          style: tt.labelSmall?.copyWith(
                                            color: foreground,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ),
                                  if (widget.onRemove != null && voted)
                                    const SizedBox(width: 8),
                                  if (widget.onRemove != null && voted)
                                    IconButton(
                                      onPressed: widget.isProcessing
                                          ? null
                                          : widget.onRemove,
                                      icon: const Icon(
                                        Icons.delete_outline,
                                        size: 18,
                                      ),
                                      color: foreground,
                                      tooltip: 'Eliminar voto',
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        crossFadeState: _expanded
                            ? CrossFadeState.showSecond
                            : CrossFadeState.showFirst,
                        duration: const Duration(milliseconds: 200),
                      ),
                    ],
                  ),
                ),

                // Overlay de “procesando”
                if (widget.isProcessing)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: .10),
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
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
  bool _refreshingUnits = false;

  // Nuevo: si viene unidad desde afuera, bloqueamos el buscador
  late final bool _unitLocked;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller;
    _searchCtrl = TextEditingController();
    _selectedUnit = widget.initialUnit;
    _unitLocked = widget.initialUnit != null;

    if (_unitLocked && widget.initialUnit != null) {
      // Mostramos el número de unidad pero no dejamos editar
      _searchCtrl.text = widget.initialUnit!.unitNumber;
    }

    Future.microtask(_refreshLatestUnits);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _refreshLatestUnits() async {
    if (!mounted) return;
    setState(() {
      _refreshingUnits = true;
    });
    try {
      await _controller.refreshUnitsSnapshot(refreshVotes: true);
    } finally {
      if (!mounted) return;
      setState(() {
        _refreshingUnits = false;
      });
    }
  }

  List<HorizontalPropertyVotingLiveUnit> get _units {
    final units = _controller.liveUnits;

    // Si la unidad viene desde la card (_UnitVoteChip), la bloqueamos:
    if (_unitLocked && _selectedUnit != null) {
      final selectedId = _selectedUnit!.propertyUnitId;
      final match = units.firstWhereOrNull(
        (u) => u.propertyUnitId == selectedId,
      );

      if (match != null && !match.hasVoted) {
        // Siempre mostramos SOLO esa unidad
        return [match];
      }

      // Si por alguna razón ya votó, mostramos vacío para que salga el mensaje
      return const <HorizontalPropertyVotingLiveUnit>[];
    }

    final query = _searchCtrl.text.trim().toLowerCase();

    HorizontalPropertyVotingLiveUnit? effectiveSelected = _selectedUnit;
    if (effectiveSelected != null) {
      final selectedId = effectiveSelected.propertyUnitId;
      final match = units.firstWhereOrNull(
        (unit) => unit.propertyUnitId == selectedId,
      );
      if (match != null) {
        if (match.hasVoted) {
          effectiveSelected = null;
          _selectedUnit = null;
        } else if (!identical(match, effectiveSelected)) {
          effectiveSelected = match;
          _selectedUnit = match;
        }
      } else if (effectiveSelected.hasVoted) {
        effectiveSelected = null;
        _selectedUnit = null;
      }
    }

    final pendingUnits = units
        .where((unit) => !unit.hasVoted)
        .toList(growable: false);

    final selected = effectiveSelected;
    if (query.isEmpty) {
      if (selected != null) {
        return [selected];
      }
      pendingUnits.sort((a, b) => a.unitNumber.compareTo(b.unitNumber));
      return pendingUnits;
    }

    var filtered =
        pendingUnits
            .where((unit) {
              final unitNumber = unit.unitNumber.toLowerCase();
              final resident = unit.residentName?.toLowerCase() ?? '';
              return unitNumber.contains(query) || resident.contains(query);
            })
            .toList(growable: false)
          ..sort((a, b) => a.unitNumber.compareTo(b.unitNumber));

    if (selected != null &&
        filtered.every(
          (unit) => unit.propertyUnitId != selected.propertyUnitId,
        )) {
      filtered = List<HorizontalPropertyVotingLiveUnit>.of(filtered)
        ..add(selected);
    }
    return filtered;
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

  Color? _parseColor(String? value) {
    if (value == null || value.isEmpty) return null;
    try {
      final hex = value.replaceFirst('#', '');
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
                          // Header estilo app moderna
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

                          // Buscador (bloqueado si viene unidad desde vivo)
                          TextField(
                            controller: _searchCtrl,
                            readOnly: _unitLocked,
                            enabled: !_unitLocked,
                            decoration: InputDecoration(
                              labelText: _unitLocked
                                  ? 'Unidad seleccionada'
                                  : 'Buscar unidad',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: _unitLocked
                                  ? const Icon(Icons.lock_outline)
                                  : (_searchCtrl.text.isNotEmpty
                                        ? IconButton(
                                            onPressed: () {
                                              _searchCtrl.clear();
                                              setState(() {});
                                            },
                                            icon: const Icon(Icons.close),
                                          )
                                        : null),
                              filled: true,
                              fillColor: cs.surfaceContainerHighest,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            onChanged: _unitLocked
                                ? null
                                : (value) {
                                    setState(() {});
                                  },
                          ),
                          if (_unitLocked) ...[
                            const SizedBox(height: 6),
                            Text(
                              'La unidad se seleccionó desde la votación en vivo y no puede cambiarse aquí.',
                              style: tt.bodySmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                          const SizedBox(height: 12),

                          const SizedBox(height: 12),
                          Obx(() {
                            // Forzamos rebuild cuando cambie liveData
                            _controller.liveData.value;

                            final cs = Theme.of(context).colorScheme;
                            final tt = Theme.of(context).textTheme;
                            final query = _searchCtrl.text.trim();

                            // 👇 Si NO hay unidad bloqueada y el buscador está vacío, mostramos sólo un hint
                            if (!_unitLocked && query.isEmpty) {
                              return DecoratedBox(
                                decoration: BoxDecoration(
                                  color: cs.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: cs.outlineVariant),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 14,
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.search,
                                        color: cs.onSurfaceVariant.withValues(
                                          alpha: .7,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          'Empieza a escribir para buscar una unidad',
                                          style: tt.bodyMedium?.copyWith(
                                            color: cs.onSurfaceVariant
                                                .withValues(alpha: .9),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }

                            final units = _units;

                            if (units.isEmpty) {
                              if (_refreshingUnits) {
                                return const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 24),
                                  child: Center(
                                    child: SizedBox(
                                      height: 22,
                                      width: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.4,
                                      ),
                                    ),
                                  ),
                                );
                              }
                              return DecoratedBox(
                                decoration: BoxDecoration(
                                  color: cs.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: cs.outlineVariant),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Text(
                                    _unitLocked
                                        ? 'La unidad seleccionada ya registró su voto.'
                                        : 'No se encontraron unidades para la búsqueda.',
                                    style: tt.bodyMedium?.copyWith(
                                      color: cs.onSurfaceVariant,
                                    ),
                                  ),
                                ),
                              );
                            }

                            // Helpers para selección (RadioGroup + tap en la fila)
                            void handleSelectById(int? id) {
                              if (_unitLocked)
                                return; // bloqueamos cambios si viene fijada

                              setState(() {
                                if (id == null) {
                                  _selectedUnit = null;
                                  return;
                                }
                                final currentId = _selectedUnit?.propertyUnitId;
                                if (currentId == id) {
                                  _selectedUnit = null;
                                  return;
                                }
                                _selectedUnit = units.firstWhereOrNull(
                                  (u) => u.propertyUnitId == id,
                                );
                              });
                            }

                            void handleSelectUnit(
                              HorizontalPropertyVotingLiveUnit unit,
                            ) {
                              handleSelectById(unit.propertyUnitId);
                            }

                            return RadioGroup<int>(
                              groupValue: _selectedUnit?.propertyUnitId,
                              onChanged: handleSelectById,
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  color: cs.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: cs.outlineVariant),
                                ),
                                child: ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: units.length,
                                  separatorBuilder: (_, __) => Divider(
                                    height: 1,
                                    color: cs.outlineVariant.withValues(
                                      alpha: .5,
                                    ),
                                  ),
                                  itemBuilder: (context, index) {
                                    final unit = units[index];
                                    final isDisabled =
                                        unit.hasVoted || _unitLocked;
                                    final isSelected =
                                        _selectedUnit?.propertyUnitId ==
                                        unit.propertyUnitId;

                                    return Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: isDisabled
                                            ? null
                                            : () => handleSelectUnit(unit),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 8,
                                          ),
                                          child: Row(
                                            children: [
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          child: Text(
                                                            unit.unitNumber,
                                                            style: tt.titleSmall
                                                                ?.copyWith(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                ),
                                                          ),
                                                        ),
                                                        if (unit.hasVoted)
                                                          Icon(
                                                            Icons.how_to_vote,
                                                            color: cs.primary,
                                                            size: 18,
                                                          ),
                                                      ],
                                                    ),
                                                    if (unit
                                                            .residentName
                                                            ?.isNotEmpty ==
                                                        true)
                                                      Padding(
                                                        padding:
                                                            const EdgeInsets.only(
                                                              top: 2,
                                                            ),
                                                        child: Text(
                                                          unit.residentName!,
                                                          style: tt.bodySmall
                                                              ?.copyWith(
                                                                color: cs
                                                                    .onSurfaceVariant,
                                                              ),
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              if (!isDisabled)
                                                Radio<int>(
                                                  value: unit.propertyUnitId,
                                                  // groupValue/onChanged viene del RadioGroup
                                                )
                                              else if (_unitLocked &&
                                                  isSelected)
                                                const Icon(
                                                  Icons.lock_outline,
                                                  size: 18,
                                                ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            );
                          }),

                          const SizedBox(height: 20),

                          // Opciones de votación (cards compactas)
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
                            ...options.map((option) {
                              final selected = _selectedOptionId == option.id;
                              final optionColor =
                                  _parseColor(option.color) ?? cs.primary;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? optionColor.withValues(alpha: .08)
                                      : cs.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: selected
                                        ? optionColor
                                        : cs.outlineVariant,
                                  ),
                                ),
                                child: CheckboxListTile(
                                  value: selected,
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedOptionId = value == true
                                          ? option.id
                                          : null;
                                    });
                                  },
                                  controlAffinity:
                                      ListTileControlAffinity.leading,
                                  title: Text(
                                    option.optionText,
                                    style: tt.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  subtitle: Text(
                                    'Código ${option.optionCode}',
                                    style: tt.bodySmall?.copyWith(
                                      color: cs.onSurfaceVariant,
                                    ),
                                  ),
                                  secondary: option.color != null
                                      ? CircleAvatar(
                                          radius: 12,
                                          backgroundColor: optionColor,
                                        )
                                      : null,
                                ),
                              );
                            }),
                          const SizedBox(height: 16),

                          if (_errorMessage != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _InlineError(message: _errorMessage!),
                            ),

                          // Botones inferiores
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

// Compact info chip widget for voting group details
class _ColoredInfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ColoredInfoChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Chip(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      visualDensity: VisualDensity.compact,
      backgroundColor: color.withValues(alpha: 0.12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
        side: BorderSide(color: color.withValues(alpha: 0.3)),
      ),
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: tt.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
