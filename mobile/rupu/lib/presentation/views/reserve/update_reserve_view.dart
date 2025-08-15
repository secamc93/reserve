import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/presentation/views/reserve/data_time_tile.dart';

import 'reserve_update_controller.dart';

class UpdateReserveView extends StatefulWidget {
  const UpdateReserveView({super.key});
  static const name = 'reserve_update';

  @override
  State<UpdateReserveView> createState() => _UpdateReserveViewState();
}

class _UpdateReserveViewState extends State<UpdateReserveView> {
  final _formKey = GlobalKey<FormState>();
  final _guestsCtrl = TextEditingController();
  DateTime? _start;
  DateTime? _end;
  bool _init = false;
  bool _saving = false;

  @override
  void dispose() {
    _guestsCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GetX<ReserveUpdateController>(builder: (ctrl) {
      if (ctrl.isLoading.value || ctrl.reserva.value == null) {
        return Scaffold(
          appBar: AppBar(title: Text('Actualizar reserva')),
          body: Center(child: CircularProgressIndicator()),
        );
      }
      final r = ctrl.reserva.value!;
      if (!_init) {
        _start = r.startAt.toLocal();
        _end = r.endAt.toLocal();
        _guestsCtrl.text = r.numberOfGuests.toString();
        _init = true;
      }
      return Scaffold(
        appBar: AppBar(title: const Text('Actualizar reserva')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: DateTimeTile(
                        label: 'Inicio',
                        value: DateFormat('EEE d MMM, HH:mm', 'es').format(_start!),
                        onTap: _pickStart,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DateTimeTile(
                        label: 'Fin',
                        value: DateFormat('EEE d MMM, HH:mm', 'es').format(_end!),
                        onTap: _pickEnd,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _guestsCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Número de personas',
                    prefixIcon: Icon(Icons.group),
                  ),
                  validator: (v) {
                    final n = int.tryParse(v ?? '');
                    if (n == null || n <= 0) return 'Ingrese un número válido';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  enabled: false,
                  decoration: const InputDecoration(
                    labelText: 'Mesa (próximamente)',
                    prefixIcon: Icon(Icons.table_bar),
                  ),
                ),
                const SizedBox(height: 24),
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
                                final guests = int.parse(_guestsCtrl.text);
                                setState(() => _saving = true);
                                final ok = await ctrl.actualizar(
                                  id: r.reservaId,
                                  startAt: _start!,
                                  endAt: _end!,
                                  numberOfGuests: guests,
                                );
                                setState(() => _saving = false);
                                if (!mounted) return;
                                if (ok) {
                                  Navigator.of(context).pop();
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content:
                                          Text('No se pudo actualizar la reserva'),
                                    ),
                                  );
                                }
                              },
                        icon: _saving
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.save),
                        label:
                            Text(_saving ? 'Guardando…' : 'Guardar'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    });
  }

  Future<void> _pickStart() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _start!,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );
    if (date == null) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_start!),
      helpText: 'Hora de inicio',
    );
    if (time == null) return;
    setState(() {
      _start = DateTime(date.year, date.month, date.day, time.hour, time.minute);
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
    if (date == null) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_end!),
      helpText: 'Hora de fin',
    );
    if (time == null) return;
    final tmp = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    if (!tmp.isAfter(_start!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Debe ser después del inicio')),
      );
      return;
    }
    setState(() {
      _end = tmp;
    });
  }
}
