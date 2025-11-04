part of 'horizontal_property_detail_view.dart';

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

// ─────────────────────────────────────────────────────────────
// SECTION CARD PREMIUM (con header, acciones, colapsable y grid)
// ─────────────────────────────────────────────────────────────
class SectionCard extends StatefulWidget {
  const SectionCard({
    required this.title,
    this.child, // Compatibilidad: si lo pasas, se muestra tal cual
    this.subtitle,
    this.leadingIcon,
    this.headerActions,
    this.gridFields, // Si lo pasas, se renderiza como grid responsivo
    this.footer, // Ideal para acciones: aplicar/limpiar
    this.collapsible = false, // Header clicable para colapsar/expandir
    this.initiallyExpanded = true,
    this.contentPadding = const EdgeInsets.fromLTRB(16, 14, 16, 14),
    this.gap = 12,
  });

  final String title;
  final String? subtitle;
  final IconData? leadingIcon;
  final List<Widget>? headerActions;

  // Layout del body: usa uno u otro
  final Widget? child; // layout libre (compat)
  final List<Widget>? gridFields; // layout premium (grid responsivo)

  final Widget? footer; // zona inferior (botones, tags, etc.)
  final bool collapsible;
  final bool initiallyExpanded;
  final EdgeInsets contentPadding;
  final double gap;

  @override
  State<SectionCard> createState() => _SectionCardState();
}

class _SectionCardState extends State<SectionCard> {
  late bool _expanded;

  @override
  void initState() {
    super.initState();
    _expanded = widget.initiallyExpanded;
  }

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
      child: Column(
        children: [
          // Header
          InkWell(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            onTap: widget.collapsible
                ? () => setState(() => _expanded = !_expanded)
                : null,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
              child: Row(
                children: [
                  if (widget.leadingIcon != null) ...[
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: cs.primary.withValues(alpha: .08),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: cs.primary.withValues(alpha: .18),
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Icon(widget.leadingIcon, color: cs.primary),
                    ),
                    const SizedBox(width: 10),
                  ],
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.title,
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: cs.onSurface,
                          ),
                        ),
                        if (widget.subtitle?.isNotEmpty == true) ...[
                          const SizedBox(height: 2),
                          Text(
                            widget.subtitle!,
                            style: tt.bodySmall?.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (widget.headerActions?.isNotEmpty == true) ...[
                    ...widget.headerActions!,
                    const SizedBox(width: 4),
                  ],
                  if (widget.collapsible)
                    Icon(
                      _expanded
                          ? Icons.expand_less_rounded
                          : Icons.expand_more_rounded,
                      color: cs.onSurfaceVariant,
                    ),
                ],
              ),
            ),
          ),

          // Divider sutil
          Divider(height: 1, thickness: 1, color: cs.outlineVariant),

          // Body (animado)
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: widget.contentPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.gridFields?.isNotEmpty == true) ...[
                    ResponsiveFormGrid(children: widget.gridFields!),
                  ] else if (widget.child != null) ...[
                    widget.child!,
                  ],

                  if (widget.footer != null) ...[
                    SizedBox(height: widget.gap),
                    widget.footer!,
                  ],
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
    );
  }
}

// ─────────────────────────────────────────────────────────────
// INPUTS PREMIUM DE FILTRO (TextField y Dropdown)
// ─────────────────────────────────────────────────────────────

class FilterTextField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final IconData? prefixIcon;
  final String? hint;

  const FilterTextField({
    required this.label,
    required this.controller,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
    this.prefixIcon,
    this.hint,
  });

  @override
  Widget build(BuildContext context) {
    final deco = _filterDecoration(context, label, hint: hint);
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction ?? TextInputAction.next,
      onSubmitted: onSubmitted,
      maxLines: 1,
      decoration: prefixIcon == null
          ? deco
          : deco.copyWith(prefixIcon: Icon(prefixIcon)),
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

class SummaryHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool showProgress;
  final VoidCallback onRefresh;

  const SummaryHeader({
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

// class _FilterTextField extends StatelessWidget {
//   final String label;
//   final TextEditingController controller;
//   final TextInputType? keyboardType;
//   final TextInputAction? textInputAction;
//   final ValueChanged<String>? onSubmitted;

//   const _FilterTextField({
//     required this.label,
//     required this.controller,
//     this.keyboardType,
//     this.textInputAction,
//     this.onSubmitted,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return TextField(
//       controller: controller,
//       keyboardType: keyboardType,
//       textInputAction: textInputAction ?? TextInputAction.next,
//       onSubmitted: onSubmitted,
//       maxLines: 1,
//       decoration: _filterDecoration(context, label),
//     );
//   }
// }

class ResponsiveFormGrid extends StatelessWidget {
  final List<Widget> children;
  final double minChildWidth;

  const ResponsiveFormGrid({required this.children, this.minChildWidth = 220});

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) {
      return const SizedBox.shrink();
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        var maxWidth = constraints.maxWidth;
        if (!maxWidth.isFinite) {
          maxWidth = MediaQuery.of(context).size.width;
        }
        int columns;
        if (maxWidth >= 1200) {
          columns = 4;
        } else if (maxWidth >= 900) {
          columns = 3;
        } else if (maxWidth >= 620) {
          columns = 2;
        } else {
          columns = 1;
        }
        columns = columns.clamp(1, children.length);
        final spacing = 12.0;
        final totalSpacing = spacing * (columns - 1);
        final availableWidth = maxWidth - totalSpacing;
        double childWidth;
        if (columns == 1) {
          childWidth = maxWidth;
        } else {
          childWidth = availableWidth / columns;
          if (childWidth < minChildWidth) {
            childWidth = minChildWidth;
          }
          if (childWidth > maxWidth) {
            childWidth = maxWidth;
          }
        }
        return Wrap(
          spacing: spacing,
          runSpacing: 12,
          children: children
              .map(
                (child) => SizedBox(
                  width: columns == 1 ? maxWidth : childWidth,
                  child: child,
                ),
              )
              .toList(),
        );
      },
    );
  }
}

class _FilterActionsRow extends StatelessWidget {
  final VoidCallback onClear;
  final VoidCallback onApply;
  final bool isBusy;

  const _FilterActionsRow({
    required this.onClear,
    required this.onApply,
    this.isBusy = false,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 520;
        final clearButton = TextButton.icon(
          onPressed: isBusy ? null : onClear,
          icon: const Icon(Icons.cleaning_services_outlined),
          label: const Text('Limpiar filtros'),
        );
        final applyButton = FilledButton.icon(
          onPressed: isBusy ? null : onApply,
          icon: const Icon(Icons.filter_alt_outlined),
          label: const Text('Aplicar filtros'),
        );
        if (isCompact) {
          final width = constraints.maxWidth == double.infinity
              ? MediaQuery.of(context).size.width
              : constraints.maxWidth;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 44, width: width, child: clearButton),
              const SizedBox(height: 8),
              SizedBox(height: 44, width: width, child: applyButton),
            ],
          );
        }
        return Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            SizedBox(height: 44, child: clearButton),
            const SizedBox(width: 12),
            SizedBox(height: 44, child: applyButton),
          ],
        );
      },
    );
  }
}

class _ActiveFilterChipData {
  final String label;
  final VoidCallback onRemove;

  const _ActiveFilterChipData({required this.label, required this.onRemove});
}

class _ActiveFiltersBar extends StatelessWidget {
  final List<_ActiveFilterChipData> filters;
  final VoidCallback? onClearAll;

  const _ActiveFiltersBar({required this.filters, this.onClearAll});

  @override
  Widget build(BuildContext context) {
    if (filters.isEmpty) return const SizedBox.shrink();
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.tune, size: 18, color: cs.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Filtros activos (${filters.length})',
                  style: tt.labelLarge?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              if (onClearAll != null)
                TextButton(
                  onPressed: onClearAll,
                  child: const Text('Limpiar todo'),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: filters
                .map(
                  (filter) => InputChip(
                    label: Text(filter.label),
                    onDeleted: filter.onRemove,
                    deleteIcon: const Icon(Icons.close, size: 16),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    labelStyle: tt.bodyMedium,
                    backgroundColor: cs.surface,
                    shape: StadiumBorder(
                      side: BorderSide(color: cs.outlineVariant),
                    ),
                    visualDensity: VisualDensity.compact,
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

InputDecoration _filterDecoration(
  BuildContext context,
  String label, {
  String? hint,
}) {
  final cs = Theme.of(context).colorScheme;
  return InputDecoration(
    labelText: label,
    hintText: hint,
    isDense: true,
    filled: true,
    fillColor: cs.surfaceContainerHighest,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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

class _CardActions extends StatelessWidget {
  final VoidCallback? onView;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final bool isEditDisabled;
  final bool isDeleteDisabled;
  final bool showDeleteLoader;
  const _CardActions({
    this.onView,
    this.onEdit,
    this.onDelete,
    this.isEditDisabled = false,
    this.isDeleteDisabled = false,
    this.showDeleteLoader = false,
  });

  ButtonStyle _primaryStyle(BuildContext context) {
    return FilledButton.styleFrom(
      minimumSize: const Size(0, 36),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
    );
  }

  ButtonStyle _tonalStyle(BuildContext context) {
    return FilledButton.styleFrom(
      minimumSize: const Size(0, 36),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
    );
  }

  ButtonStyle _dangerStyle(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return TextButton.styleFrom(
      minimumSize: const Size(0, 36),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      foregroundColor: cs.error,
      visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        FilledButton.icon(
          style: _primaryStyle(context),
          onPressed: onView,
          icon: const Icon(Icons.visibility_outlined, size: 18),
          label: const Text('Ver'),
        ),
        FilledButton.tonalIcon(
          style: _tonalStyle(context),
          onPressed: isEditDisabled ? null : onEdit,
          icon: const Icon(Icons.edit_outlined, size: 18),
          label: const Text('Editar'),
        ),
        TextButton.icon(
          style: _dangerStyle(context),
          onPressed:
              (isDeleteDisabled || showDeleteLoader) ? null : onDelete,
          icon: showDeleteLoader
              ? SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: Theme.of(context).colorScheme.error,
                  ),
                )
              : const Icon(Icons.delete_outline, size: 18),
          label: Text(showDeleteLoader ? 'Eliminando...' : 'Eliminar'),
        ),
      ],
    );
  }
}

void _showActionFeedback(String title, String message) {
  if (Get.isSnackbarOpen) {
    Get.closeCurrentSnackbar();
  }
  Get.snackbar(
    title,
    message,
    snackPosition: SnackPosition.BOTTOM,
    duration: const Duration(seconds: 3),
    margin: const EdgeInsets.all(16),
  );
}
