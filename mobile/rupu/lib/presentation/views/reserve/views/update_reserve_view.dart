// presentation/views/reserve/update_reserve_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';

import '../widgets.dart';
import '../controllers/reserve_update_controller.dart';
import '../controllers/reserves_controller.dart';
import '../controllers/reserve_status_controller.dart';
import 'package:rupu/domain/entities/reserve_status.dart';

class UpdateReserveView extends StatefulWidget {
  const UpdateReserveView({super.key});
  static const name = 'reserve_update';

  @override
  State<UpdateReserveView> createState() => _UpdateReserveViewState();
}

class _UpdateReserveViewState extends State<UpdateReserveView> {
  final _formKey = GlobalKey<FormState>();
  final _guestsCtrl = TextEditingController();
  final _statusCtrl = TextEditingController();

  ReserveStatus? _selectedStatus;
  late final ReserveStatusController _statusController;

  DateTime? _start;
  DateTime? _end;
  bool _init = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _statusController = Get.put(ReserveStatusController());
  }

  @override
  void dispose() {
    _guestsCtrl.dispose();
    _statusCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    const locale = 'es';

    Future<bool> confirmSaveDialog({
      required String title,
      required String message,
    }) async {
      final result = await showDialog<bool>(
        context: context,
        barrierDismissible: false, // ← no se cierra tocando afuera
        useRootNavigator: false, // ← usa el navigator de esta página
        builder: (dialogContext) => AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(
                dialogContext,
              ).pop(false), // ← cierra SOLO el diálogo
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () =>
                  Navigator.of(dialogContext).pop(true), // ← confirma
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return result ?? false;
    }

    return GetX<ReserveUpdateController>(
      builder: (ctrl) {
        if (ctrl.isLoading.value || ctrl.reserva.value == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Actualizar reserva')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        final r = ctrl.reserva.value!;
        if (!_init) {
          _start = r.startAt.toLocal();
          _end = r.endAt.toLocal();
          _guestsCtrl.text = r.numberOfGuests.toString();
          final latest = r.statusHistory.isNotEmpty
              ? r.statusHistory.last
              : null;
          if (latest != null) {
            _selectedStatus = ReserveStatus(
              id: latest.statusId,
              code: latest.statusCode,
              name: latest.statusName,
            );
            _statusCtrl.text = _selectedStatus!.name;
          }
          _init = true;
        }

        final dfHeader = DateFormat('EEE d MMM, HH:mm', locale);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Actualizar reserva'),
            centerTitle: true,
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              // ── Encabezado premium
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      cs.primary.withValues(alpha: .10),
                      cs.secondary.withValues(alpha: .08),
                    ],
                  ),
                  border: Border.all(color: cs.outlineVariant),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: cs.primary.withValues(alpha: .12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.edit_calendar, color: cs.primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Editar horario',
                            style: tt.titleLarge!.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${dfHeader.format(_start!)} – ${DateFormat('HH:mm', locale).format(_end!)}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: tt.bodyMedium!.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // ── Tarjeta del formulario
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: cs.outlineVariant),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: DateTimeTile(
                              label: 'Inicio',
                              value: dfHeader.format(_start!),
                              onTap: _pickStart,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DateTimeTile(
                              label: 'Fin',
                              value: dfHeader.format(_end!),
                              onTap: _pickEnd,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _guestsCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Número de personas',
                          hintText: 'Ej: 2',
                          prefixIcon: Icon(Icons.group_outlined),
                        ),
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        validator: (v) {
                          final n = int.tryParse((v ?? '').trim());
                          if (n == null || n <= 0) {
                            return 'Ingrese un número válido';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _statusCtrl,
                        readOnly: true,
                        decoration: const InputDecoration(
                          labelText: 'Estado',
                          prefixIcon: Icon(Icons.flag_outlined),
                          suffixIcon: Icon(Icons.arrow_drop_down),
                        ),
                        onTap: _pickStatus,
                        validator: (_) {
                          if (_selectedStatus == null) {
                            return 'Seleccione un estado';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        enabled: false,
                        decoration: const InputDecoration(
                          labelText: 'Mesa (próximamente)',
                          prefixIcon: Icon(Icons.table_bar_outlined),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 18),

              // ── Barra de acciones (premium, full-width)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _saving
                          ? null
                          : () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _saving
                          ? null
                          : () async {
                              if (!_formKey.currentState!.validate()) return;

                              final guests = int.parse(_guestsCtrl.text.trim());
                              if (!_end!.isAfter(_start!)) {
                                _snack('Hora fin debe ser mayor a inicio');
                                return;
                              }

                              // 1) Confirmación previa
                              final confirmed = await confirmSaveDialog(
                                title: 'Confirmar cambios',
                                message:
                                    '¿Deseas guardar esta actualización de la reserva?',
                              );
                              if (!confirmed) return;

                              // 2) Guardar
                              setState(() => _saving = true);
                              final ok = await ctrl.actualizar(
                                id: r.reservaId,
                                startAt: _start!,
                                endAt: _end!,
                                numberOfGuests: guests,
                                statusId: _selectedStatus?.id ??
                                    r.statusHistory.last.statusId,
                              );
                              setState(() => _saving = false);
                              if (!mounted) return;

                              if (ok) {
                                // Refresca HOY y TODAS
                                final listCtrl =
                                    Get.isRegistered<ReserveController>()
                                    ? Get.find<ReserveController>()
                                    : null;
                                await listCtrl?.cargarReservasHoy(silent: true);
                                await listCtrl?.cargarReservasTodas.call(
                                  silent: true,
                                ); // <- ajusta el nombre si es distinto

                                // 3) Modal de éxito con botón "Listo"
                                await _showSuccessSheet(
                                  title: 'Reserva actualizada',
                                  message:
                                      'Los cambios se guardaron correctamente.',
                                );
                                if (!context.mounted) return;

                                if (mounted) Navigator.of(context).pop();
                              } else {
                                _errorDialog(
                                  'No se pudo actualizar la reserva',
                                );
                              }
                            },

                      icon: _saving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.save_outlined),
                      label: Text(_saving ? 'Guardando…' : 'Guardar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickStatus() async {
    if (_statusController.estados.isEmpty) {
      await _statusController.cargarEstados();
    }
    
    final selected = await showModalBottomSheet<ReserveStatus>(
      context: context,
      builder: (_) {
        return ListView(
          children: _statusController.estados
              .map(
                (e) => ListTile(
                  title: Text(e.name),
                  onTap: () => Navigator.of(context).pop(e),
                ),
              )
              .toList(),
        );
      },
    );
    if (selected != null) {
      setState(() {
        _selectedStatus = selected;
        _statusCtrl.text = selected.name;
      });
    }
  }

  Future<void> _pickStart() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _start!,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );

    if (!mounted) return;
    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_start!.toLocal()),
      helpText: 'Hora de inicio',
    );

    if (time == null) return;

    setState(() {
      _start = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
      if (!_end!.isAfter(_start!)) {
        _end = _start!.add(const Duration(hours: 1));
      }
    });
  }

  Future<void> _pickEnd() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _end!.isAfter(_start!) ? _end! : _start!,
      firstDate: _start!,
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );

    if (!mounted) return;
    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_end!.toLocal()),
      helpText: 'Hora de fin',
    );
    if (time == null) return;

    final tmp = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
    if (!tmp.isAfter(_start!)) {
      _snack('Debe ser después del inicio');
      return;
    }
    setState(() => _end = tmp);
  }

  // ────────────── UI helpers ──────────────
  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _errorDialog(String msg) async {
    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Error'),
        content: Text(msg),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _showSuccessSheet({
    required String title,
    required String message,
  }) async {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: false,
      showDragHandle: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle, color: cs.primary, size: 40),
              const SizedBox(height: 8),
              Text(
                title,
                style: tt.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                message,
                style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Listo'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
