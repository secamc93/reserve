import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/horizontal_property_voting.dart';
import 'package:rupu/presentation/views/horizontal_properties/controllers/voting_live_controller.dart';
import 'package:rupu/presentation/widgets/shared/rupu_loader.dart';

class VoteCreationSheet extends StatefulWidget {
  final VotingLiveController controller;
  final HorizontalPropertyVotingLiveUnit? unit;

  const VoteCreationSheet({super.key, required this.controller, this.unit});

  @override
  State<VoteCreationSheet> createState() => _VoteCreationSheetState();
}

class _VoteCreationSheetState extends State<VoteCreationSheet> {
  late final TextEditingController _searchCtrl;
  final _focusNode = FocusNode();
  HorizontalPropertyVotingLiveUnit? _selectedUnit;
  int? _selectedOptionId;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedUnit = widget.unit;
    _searchCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleUnitSelection(HorizontalPropertyVotingLiveUnit unit) {
    setState(() {
      _selectedUnit = unit;
      if (unit.hasVoted) {
        _selectedOptionId = unit.votingOptionId;
      }
      _searchCtrl.clear();
      widget.controller.clearVotingUnitSuggestions();
      FocusScope.of(context).unfocus();
    });
  }

  Future<void> _submit() async {
    if (_selectedUnit == null || _selectedOptionId == null || _saving) return;

    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      final result = await widget.controller.castVote(
        propertyUnitId: _selectedUnit!.propertyUnitId,
        optionId: _selectedOptionId!,
      );

      if (!mounted) return;

      if (result.success) {
        Navigator.of(context).pop(true);
      } else {
        setState(() {
          _saving = false;
          _errorMessage = result.message ?? 'No se pudo registrar el voto.';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _errorMessage = 'Error al registrar el voto: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final viewInsets = MediaQuery.viewInsetsOf(context);

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
                  Container(
                    width: 32,
                    height: 4,
                    decoration: BoxDecoration(
                      color: cs.outlineVariant,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Expanded(
                    child: CustomScrollView(
                      slivers: [
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Registrar Voto',
                                  style: tt.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Selecciona la unidad y la opción de voto.',
                                  style: tt.bodyMedium?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 24),

                                // Unit Selection
                                if (_selectedUnit == null) ...[
                                  TextField(
                                    controller: _searchCtrl,
                                    focusNode: _focusNode,
                                    decoration: InputDecoration(
                                      labelText: 'Buscar unidad',
                                      prefixIcon: const Icon(Icons.search),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      filled: true,
                                      fillColor: cs.surfaceContainerHighest
                                          .withValues(alpha: 0.5),
                                    ),
                                    onChanged: (value) {
                                      widget.controller.searchUnits(value);
                                    },
                                  ),
                                  const SizedBox(height: 12),
                                  Obx(() {
                                    if (widget
                                        .controller
                                        .votingUnitSuggestionsLoading
                                        .value) {
                                      return const Center(
                                        child: Padding(
                                          padding: EdgeInsets.all(16),
                                          child: RupuLoader(),
                                        ),
                                      );
                                    }
                                    final suggestions =
                                        widget.controller.votingUnitSuggestions;
                                    if (suggestions.isEmpty &&
                                        _searchCtrl.text.isNotEmpty) {
                                      return Center(
                                        child: Padding(
                                          padding: const EdgeInsets.all(16),
                                          child: Text(
                                            'No se encontraron resultados',
                                            style: tt.bodyMedium?.copyWith(
                                              color: cs.onSurfaceVariant,
                                            ),
                                          ),
                                        ),
                                      );
                                    }
                                    return ListView.separated(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      itemCount: suggestions.length,
                                      separatorBuilder: (_, __) =>
                                          const Divider(height: 1),
                                      itemBuilder: (context, index) {
                                        final item = suggestions[index];
                                        return ListTile(
                                          title: Text(item.unitNumber),
                                          subtitle: item.residentName != null
                                              ? Text(item.residentName!)
                                              : null,
                                          onTap: () =>
                                              _handleUnitSelection(item),
                                          trailing: const Icon(
                                            Icons.chevron_right,
                                          ),
                                        );
                                      },
                                    );
                                  }),
                                ] else ...[
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: cs.secondaryContainer,
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.home_work_outlined),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                _selectedUnit!.unitNumber,
                                                style: tt.titleMedium?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  color:
                                                      cs.onSecondaryContainer,
                                                ),
                                              ),
                                              if (_selectedUnit!.residentName !=
                                                  null)
                                                Text(
                                                  _selectedUnit!.residentName!,
                                                  style: tt.bodySmall?.copyWith(
                                                    color:
                                                        cs.onSecondaryContainer,
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                        if (widget.unit == null)
                                          IconButton(
                                            onPressed: () {
                                              setState(() {
                                                _selectedUnit = null;
                                                _selectedOptionId = null;
                                              });
                                            },
                                            icon: const Icon(Icons.close),
                                            color: cs.onSecondaryContainer,
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 24),

                                // Options Selection
                                if (_selectedUnit != null) ...[
                                  Text(
                                    'Opciones de Voto',
                                    style: tt.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  ...widget.controller.options.map((option) {
                                    final isSelected =
                                        _selectedOptionId == option.id;
                                    final color =
                                        _parseColor(option.color) ?? cs.primary;

                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 8),
                                      child: Material(
                                        color: isSelected
                                            ? color.withValues(alpha: 0.1)
                                            : Colors.transparent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          side: BorderSide(
                                            color: isSelected
                                                ? color
                                                : cs.outlineVariant,
                                            width: isSelected ? 2 : 1,
                                          ),
                                        ),
                                        child: InkWell(
                                          onTap: () {
                                            setState(() {
                                              _selectedOptionId = option.id;
                                            });
                                          },
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.all(16),
                                            child: Row(
                                              children: [
                                                Container(
                                                  width: 16,
                                                  height: 16,
                                                  decoration: BoxDecoration(
                                                    color: color,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: Text(
                                                    option.optionText,
                                                    style: tt.bodyLarge
                                                        ?.copyWith(
                                                          fontWeight: isSelected
                                                              ? FontWeight.bold
                                                              : FontWeight
                                                                    .normal,
                                                        ),
                                                  ),
                                                ),
                                                if (isSelected)
                                                  Icon(
                                                    Icons.check_circle,
                                                    color: color,
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                ],
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Submit Button
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        if (_errorMessage != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Text(
                              _errorMessage!,
                              style: tt.bodySmall?.copyWith(color: cs.error),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed:
                                (_selectedUnit != null &&
                                    _selectedOptionId != null &&
                                    !_saving)
                                ? _submit
                                : null,
                            child: _saving
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Registrar Voto'),
                          ),
                        ),
                      ],
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

  Color? _parseColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return null;
    }
  }
}
