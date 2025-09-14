// presentation/views/calendar/widgets/add_event_sheet.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../reserve/data_time_tile.dart'; // tu tile existente
import 'package:rupu/config/helpers/calendar_helper.dart'; // para isValidEmail si lo tienes allí

typedef AddEventSubmit =
    Future<bool> Function({
      required String name,
      required String dni,
      required String email,
      required String phone,
      required int guests,
      required DateTime start,
      required DateTime end,
      String? notes,
    });

Future<void> showAddEventSheet({
  required BuildContext context,
  required DateTime initialDate,
  required AddEventSubmit onSubmit,
}) async {
  final nameCtrl = TextEditingController();
  final dniCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final guestsCtrl = TextEditingController(text: '1');
  final notesCtrl = TextEditingController();

  DateTime start = initialDate;
  DateTime end = initialDate.add(const Duration(hours: 1));

  bool isPastDate(DateTime dt) {
    final now = DateTime.now();
    final today0 = DateTime(now.year, now.month, now.day);
    final d0 = DateTime(dt.year, dt.month, dt.day);
    return d0.isBefore(today0);
  }

  void showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  await showModalBottomSheet(
    context: context,
    useSafeArea: true,
    isScrollControlled: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) {
      return Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
          top: 6,
        ),
        child: StatefulBuilder(
          builder: (ctx, setLocal) {
            Future<void> pickStart() async {
              final date = await showDatePicker(
                context: ctx,
                initialDate: start,
                firstDate: DateTime(
                  DateTime.now().year,
                  DateTime.now().month,
                  DateTime.now().day,
                ),
                lastDate: DateTime(2100),
                locale: const Locale('es'),
              );
              if (date == null) return;
              final time = await showTimePicker(
                context: ctx,
                initialTime: TimeOfDay.fromDateTime(start),
                helpText: 'Hora de inicio',
              );
              if (time == null) return;

              final tmp = DateTime(
                date.year,
                date.month,
                date.day,
                time.hour,
                time.minute,
              );
              if (isPastDate(tmp)) {
                showSnack('La fecha debe ser hoy o futura.');
                return;
              }
              setLocal(() {
                start = tmp;
                if (!end.isAfter(start)) {
                  end = start.add(const Duration(hours: 1));
                }
              });
            }

            Future<void> pickEnd() async {
              final date = await showDatePicker(
                context: ctx,
                initialDate: end.isAfter(start) ? end : start,
                firstDate: DateTime(
                  DateTime.now().year,
                  DateTime.now().month,
                  DateTime.now().day,
                ),
                lastDate: DateTime(2100),
                locale: const Locale('es'),
              );
              if (date == null) return;

              final time = await showTimePicker(
                context: ctx,
                initialTime: TimeOfDay.fromDateTime(end),
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
              if (isPastDate(tmp)) {
                showSnack('La fecha debe ser hoy o futura.');
                return;
              }
              if (!tmp.isAfter(start)) {
                showSnack('La hora de fin debe ser mayor a la de inicio.');
                return;
              }
              setLocal(() => end = tmp);
            }

            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Nuevo evento',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Nombre del cliente *',
                      hintText: 'Ej: Ana Gómez',
                    ),
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 8),

                  TextField(
                    controller: dniCtrl,
                    decoration: const InputDecoration(
                      labelText: 'DNI / Documento',
                      hintText: 'Ej: 12345678',
                    ),
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 8),

                  TextField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      hintText: 'ejemplo@dominio.com',
                    ),
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 8),

                  TextField(
                    controller: phoneCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Teléfono',
                      hintText: 'Ej: 3001234567',
                    ),
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'[0-9+\- ]')),
                    ],
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 8),

                  TextField(
                    controller: guestsCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Número de personas',
                      hintText: 'Ej: 2',
                    ),
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    textInputAction: TextInputAction.next,
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: DateTimeTile(
                          label: 'Inicio',
                          value: DateFormat(
                            'EEE d MMM, HH:mm',
                            'es',
                          ).format(start),
                          onTap: pickStart,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DateTimeTile(
                          label: 'Fin',
                          value: DateFormat(
                            'EEE d MMM, HH:mm',
                            'es',
                          ).format(end),
                          onTap: pickEnd,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  TextField(
                    controller: notesCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Notas',
                      hintText: 'Opcional',
                    ),
                    minLines: 1,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      OutlinedButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Cancelar'),
                      ),
                      const SizedBox(width: 8),
                      FilledButton(
                        onPressed: () async {
                          final name = nameCtrl.text.trim();
                          final dni = dniCtrl.text.trim();
                          final email = emailCtrl.text.trim();
                          final phone = phoneCtrl.text.trim();
                          final guests =
                              int.tryParse(
                                guestsCtrl.text.trim().isEmpty
                                    ? '0'
                                    : guestsCtrl.text.trim(),
                              ) ??
                              0;
                          if (name.isEmpty) {
                            showSnack('El nombre es obligatorio.');
                            return;
                          }
                          if (isPastDate(start)) {
                            showSnack('La fecha debe ser hoy o futura.');
                            return;
                          }
                          if (!end.isAfter(start)) {
                            showSnack(
                              'La hora de fin debe ser mayor a la de inicio.',
                            );
                            return;
                          }
                          if (guests <= 0) {
                            showSnack(
                              'El número de personas debe ser mayor a 0.',
                            );
                            return;
                          }
                          if (email.isEmpty && phone.isEmpty) {
                            showSnack('Proporciona al menos email o teléfono.');
                            return;
                          }
                          if (email.isNotEmpty && !isValidEmail(email)) {
                            showSnack('Email inválido.');
                            return;
                          }

                          final ok = await onSubmit(
                            name: name,
                            dni: dni,
                            email: email,
                            phone: phone,
                            guests: guests,
                            start: start,
                            end: end,
                            notes: notesCtrl.text.trim().isEmpty
                                ? null
                                : notesCtrl.text.trim(),
                          );

                          if (ok && context.mounted) Navigator.of(ctx).pop();
                        },
                        child: const Text('Guardar'),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      );
    },
  );
}
