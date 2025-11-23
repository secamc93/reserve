import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:rupu/presentation/views/reserve/controllers/create_reserve_controller.dart';
import '../widgets.dart';

class CreateReserveView extends StatelessWidget {
  const CreateReserveView({super.key});

  static const name = 'reserve_new';

  Future<void> _pickStart(
    BuildContext context,
    CreateReserveController controller,
  ) async {
    final date = await showDatePicker(
      context: context,
      initialDate: controller.start.value,
      firstDate: DateTime(
        DateTime.now().year,
        DateTime.now().month,
        DateTime.now().day,
      ),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );
    if (date == null || !context.mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(controller.start.value.toUtc()),
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
    final ok = controller.updateStart(tmp);
    if (!ok) {
      _showSnack(context, 'La fecha debe ser hoy o futura.');
    }
  }

  Future<void> _pickEnd(
    BuildContext context,
    CreateReserveController controller,
  ) async {
    final date = await showDatePicker(
      context: context,
      initialDate:
          controller.end.value.isAfter(controller.start.value)
              ? controller.end.value
              : controller.start.value,
      firstDate: DateTime(
        DateTime.now().year,
        DateTime.now().month,
        DateTime.now().day,
      ),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );
    if (date == null || !context.mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(controller.end.value.toUtc()),
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
    final ok = controller.updateEnd(tmp);
    if (!ok) {
      final message = controller.isPastDate(tmp)
          ? 'La fecha debe ser hoy o futura.'
          : 'La hora de fin debe ser mayor a la de inicio.';
      _showSnack(context, message);
    }
  }

  Future<void> _submit(
    BuildContext context,
    CreateReserveController controller,
  ) async {
    final df = DateFormat('EEE d MMM, HH:mm', 'es');
    final name = controller.nameCtrl.text.trim();
    final guests = int.tryParse(controller.guestsCtrl.text.trim()) ?? 0;
    final email = controller.emailCtrl.text.trim();
    final phone = controller.phoneCtrl.text.trim();
    final dni = controller.dniCtrl.text.trim();

    final valid = controller.validateInputs(onError: (msg) {
      _showSnack(context, msg);
    });
    if (!valid) return;

    final confirmed = await _confirmSheet(
      context: context,
      name: name,
      guests: guests,
      timeRange: '${df.format(controller.start.value)} – ${df.format(controller.end.value)}',
      email: email.isEmpty ? null : email,
      phone: phone.isEmpty ? null : phone,
      dni: dni.isEmpty ? null : dni,
    );
    if (!confirmed) return;

    final ok = await controller.persistReservation();
    if (!ok) {
      _showSnack(context, 'No se pudo crear la reserva.');
      return;
    }

    final goBack = await _successSheet(
      context: context,
      title: '¡Reserva creada!',
      message: 'Se creó la reserva de $name para $guests persona(s).',
    );
    if (goBack && context.mounted) Navigator.of(context).pop();
  }

  void _showSnack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<bool> _confirmSheet({
    required BuildContext context,
    required String name,
    required int guests,
    required String timeRange,
    String? email,
    String? phone,
    String? dni,
  }) async {
    final cs = Theme.of(context).colorScheme;
    return await showModalBottomSheet<bool>(
          context: context,
          useSafeArea: true,
          isScrollControlled: true,
          showDragHandle: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          builder: (ctx) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                8,
                16,
                MediaQuery.of(ctx).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: cs.primaryContainer,
                        child: Icon(
                          Icons.event_available,
                          color: cs.onPrimaryContainer,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Confirmar reserva',
                        style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ConfirmRow(
                    icon: Icons.person_outline,
                    label: 'Cliente',
                    value: name,
                  ),
                  const SizedBox(height: 6),
                  ConfirmRow(
                    icon: Icons.schedule,
                    label: 'Horario',
                    value: timeRange,
                  ),
                  const SizedBox(height: 6),
                  ConfirmRow(
                    icon: Icons.group_outlined,
                    label: 'Personas',
                    value: '$guests',
                  ),
                  if ((email ?? '').isNotEmpty) ...[
                    const SizedBox(height: 6),
                    ConfirmRow(
                      icon: Icons.email_outlined,
                      label: 'Email',
                      value: email!,
                    ),
                  ],
                  if ((phone ?? '').isNotEmpty) ...[
                    const SizedBox(height: 6),
                    ConfirmRow(
                      icon: Icons.phone_outlined,
                      label: 'Teléfono',
                      value: phone!,
                    ),
                  ],
                  if ((dni ?? '').isNotEmpty) ...[
                    const SizedBox(height: 6),
                    ConfirmRow(
                      icon: Icons.badge_outlined,
                      label: 'Documento',
                      value: dni!,
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(ctx).pop(false),
                          child: const Text('Cancelar'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () => Navigator.of(ctx).pop(true),
                          icon: const Icon(Icons.check),
                          label: const Text('Confirmar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ) ??
        false;
  }

  Future<bool> _successSheet({
    required BuildContext context,
    required String title,
    required String message,
  }) async {
    return await showModalBottomSheet<bool>(
          context: context,
          useSafeArea: true,
          showDragHandle: true,
          isScrollControlled: false,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          builder: (ctx) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.green.shade100,
                        child: const Icon(
                          Icons.check_rounded,
                          color: Colors.green,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        title,
                        style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Align(alignment: Alignment.centerLeft, child: Text(message)),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => Navigator.of(ctx).pop(true),
                      child: const Text('Listo'),
                    ),
                  ),
                ],
              ),
            );
          },
        ) ??
        true;
  }

  @override
  Widget build(BuildContext context) {
    return GetX<CreateReserveController>(
      init: CreateReserveController(),
      autoRemove: true,
      builder: (controller) {
        final cs = Theme.of(context).colorScheme;
        final textTheme = Theme.of(context).textTheme;

        return SafeArea(
          child: Scaffold(
            appBar: AppBar(
              title: const Text('Nueva reserva'),
              backgroundColor: cs.primary,
              foregroundColor: cs.onPrimary,
              elevation: 0,
            ),
            body: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text(
                        'Nueva reserva',
                        style: textTheme.titleLarge!.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Completa los datos para crear una nueva reserva.',
                        style: textTheme.bodyMedium!.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Form(
                  key: controller.formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: controller.nameCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Nombre *',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (v) =>
                            (v == null || v.trim().isEmpty)
                                ? 'El nombre es obligatorio'
                                : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: controller.dniCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Documento',
                                prefixIcon: Icon(Icons.badge_outlined),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: controller.guestsCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Personas *',
                                prefixIcon: Icon(Icons.group_outlined),
                              ),
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: controller.emailCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Email',
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              keyboardType: TextInputType.emailAddress,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: controller.phoneCtrl,
                              decoration: const InputDecoration(
                                labelText: 'Teléfono',
                                prefixIcon: Icon(Icons.phone_outlined),
                              ),
                              keyboardType: TextInputType.phone,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: controller.notesCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Notas adicionales',
                          prefixIcon: Icon(Icons.notes_outlined),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Horario',
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: _DateTimeCard(
                              label: 'Inicio',
                              value: controller.start.value,
                              onTap: () => _pickStart(context, controller),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _DateTimeCard(
                              label: 'Fin',
                              value: controller.end.value,
                              onTap: () => _pickEnd(context, controller),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: controller.saving.value
                              ? null
                              : () => _submit(context, controller),
                          icon: controller.saving.value
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.check_circle_outline),
                          label: Text(
                            controller.saving.value
                                ? 'Guardando...'
                                : 'Crear reserva',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DateTimeCard extends StatelessWidget {
  final String label;
  final DateTime value;
  final VoidCallback onTap;

  const _DateTimeCard({
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    final df = DateFormat('EEE d MMM', 'es');
    final tf = DateFormat('HH:mm');

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: cs.outlineVariant),
          borderRadius: BorderRadius.circular(12),
          color: cs.surfaceContainerLow,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: cs.secondaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.event,
                color: cs.onSecondaryContainer,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: textTheme.labelMedium?.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${df.format(value)} · ${tf.format(value)}',
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
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
