// presentation/views/reserve/update_reserve_view.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../widgets.dart';
import '../controllers/reserve_update_form_controller.dart';
import '../controllers/reserve_update_controller.dart';
import '../controllers/reserves_controller.dart';
import '../controllers/reserve_status_controller.dart';
import 'package:rupu/domain/entities/reserve_status.dart';

class UpdateReserveView extends StatelessWidget {
  UpdateReserveView({super.key});
  static const name = 'reserve_update';

  final ReserveUpdateController updateController =
      Get.isRegistered<ReserveUpdateController>()
          ? Get.find<ReserveUpdateController>()
          : Get.put(ReserveUpdateController());

  final ReserveUpdateFormController formController =
      Get.isRegistered<ReserveUpdateFormController>()
          ? Get.find<ReserveUpdateFormController>()
          : Get.put(ReserveUpdateFormController());

  final ReserveStatusController statusController =
      Get.isRegistered<ReserveStatusController>()
          ? Get.find<ReserveStatusController>()
          : Get.put(ReserveStatusController());

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
      init: updateController,
      builder: (ctrl) {
        if (ctrl.isLoading.value || ctrl.reserva.value == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Actualizar reserva')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        final r = ctrl.reserva.value!;
        formController.hydrateFromReserve(r);
        final dfHeader = DateFormat('EEE d MMM, HH:mm', locale);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Actualizar reserva'),
            centerTitle: true,
          ),
          body: Obx(() {
            final start = formController.start.value;
            final end = formController.end.value;

            if (start == null || end == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              children: [
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
                              '${dfHeader.format(start)} – ${DateFormat('HH:mm', locale).format(end)}',
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

                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cs.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cs.outlineVariant),
                  ),
                  child: Form(
                    key: formController.formKey,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: DateTimeTile(
                                label: 'Inicio',
                                value: dfHeader.format(start),
                                onTap: () => _pickStart(context),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DateTimeTile(
                                label: 'Fin',
                                value: dfHeader.format(end),
                                onTap: () => _pickEnd(context),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: formController.guestsCtrl,
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
                          controller: formController.statusCtrl,
                          readOnly: true,
                          decoration: const InputDecoration(
                            labelText: 'Estado',
                            prefixIcon: Icon(Icons.flag_outlined),
                            suffixIcon: Icon(Icons.arrow_drop_down),
                          ),
                          onTap: () => _pickStatus(context),
                          validator: (_) {
                            if (formController.selectedStatus.value == null) {
                              return 'Seleccione un estado';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        const TextFormField(
                          enabled: false,
                          decoration: InputDecoration(
                            labelText: 'Mesa (próximamente)',
                            prefixIcon: Icon(Icons.table_bar_outlined),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 18),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: formController.saving.value
                            ? null
                            : () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: formController.saving.value
                            ? null
                            : () async {
                                if (!formController.formKey.currentState!
                                    .validate()) return;

                                final guests =
                                    int.parse(formController.guestsCtrl.text.trim());
                                if (!(formController.end.value!
                                    .isAfter(formController.start.value!))) {
                                  _snack(context,
                                      'Hora fin debe ser mayor a inicio');
                                  return;
                                }

                                final confirmed = await confirmSaveDialog(
                                  title: 'Confirmar cambios',
                                  message:
                                      '¿Deseas guardar esta actualización de la reserva?',
                                );
                                if (!confirmed) return;

                                formController.saving.value = true;
                                final ok = await ctrl.actualizar(
                                  id: r.reservaId,
                                  startAt: formController.start.value!,
                                  endAt: formController.end.value!,
                                  numberOfGuests: guests,
                                  statusId: formController.selectedStatusId ??
                                      (r.statusHistory.isNotEmpty
                                          ? r.statusHistory.last.statusId
                                          : 0),
                                );
                                formController.saving.value = false;

                                if (ok) {
                                  final listCtrl =
                                      Get.isRegistered<ReserveController>()
                                          ? Get.find<ReserveController>()
                                          : null;
                                  await listCtrl?.cargarReservasHoy(silent: true);
                                  await listCtrl?.cargarReservasTodas.call(
                                    silent: true,
                                  );

                                  await _showSuccessSheet(
                                    context,
                                    title: 'Reserva actualizada',
                                    message:
                                        'Los cambios se guardaron correctamente.',
                                  );
                                  if (context.mounted) {
                                    Navigator.of(context).pop();
                                  }
                                } else {
                                  await _errorDialog(
                                    context,
                                    'No se pudo actualizar la reserva',
                                  );
                                }
                              },
                        icon: formController.saving.value
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.save_outlined),
                        label: Text(
                            formController.saving.value ? 'Guardando…' : 'Guardar'),
                      ),
                    ),
                  ],
                ),
              ],
            );
          }),
        );
      },
    );
  }

  Future<void> _pickStatus(BuildContext context) async {
    if (statusController.estados.isEmpty) {
      await statusController.cargarEstados();
    }

    final selected = await showModalBottomSheet<ReserveStatus>(
      context: context,
      builder: (_) {
        return ListView(
          children: statusController.estados
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
      formController.selectStatus(selected);
    }
  }

  Future<void> _pickStart(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: formController.start.value ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );

    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        (formController.start.value ?? DateTime.now()).toLocal(),
      ),
      helpText: 'Hora de inicio',
    );

    if (time == null) return;

    formController.setStart(
      DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      ),
    );
  }

  Future<void> _pickEnd(BuildContext context) async {
    final start = formController.start.value ?? DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: formController.end.value ?? start,
      firstDate: start,
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );

    if (date == null) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        (formController.end.value ?? start.add(const Duration(hours: 1)))
            .toLocal(),
      ),
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
    final ok = formController.setEnd(tmp);
    if (!ok) {
      _snack(context, 'Debe ser después del inicio');
    }
  }

  // ────────────── UI helpers ──────────────
  void _snack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _errorDialog(BuildContext context, String msg) async {
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

  Future<void> _showSuccessSheet(
    BuildContext context, {
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
