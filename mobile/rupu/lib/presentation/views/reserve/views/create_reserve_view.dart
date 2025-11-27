import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:rupu/presentation/views/reserve/controllers/create_reserve_controller.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';
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
      initialDate: controller.end.value.isAfter(controller.start.value)
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

    final valid = controller.validateInputs(
      onError: (msg) {
        _showSnack(context, msg);
      },
    );
    if (!valid) return;

    final confirmed = await _confirmSheet(
      context: context,
      name: name,
      guests: guests,
      timeRange:
          '${df.format(controller.start.value)} – ${df.format(controller.end.value)}',
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
            return FractionallySizedBox(
              widthFactor: ResponsiveHelper.isTablet(ctx) ? 0.6 : 1.0,
              child: Padding(
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
            return FractionallySizedBox(
              widthFactor: ResponsiveHelper.isTablet(ctx) ? 0.6 : 1.0,
              child: Padding(
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
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(message),
                    ),
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
            backgroundColor: cs.surface,
            appBar: AppBar(
              title: const Text('Nueva reserva'),
              centerTitle: false,
            ),
            body: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: ListView(
                  padding: ResponsiveHelper.getAdaptivePadding(
                    context,
                  ).copyWith(top: 16, bottom: 24),
                  children: [
                    // Header Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: cs.surfaceContainerHighest.withValues(
                          alpha: 0.3,
                        ),
                        border: Border.all(
                          color: cs.outlineVariant.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: cs.primaryContainer,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.event_available_rounded,
                              color: cs.onPrimaryContainer,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Nueva reserva',
                                  style: textTheme.titleLarge!.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Completa los datos del cliente y horario',
                                  style: textTheme.bodyMedium!.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Form Section
                    _SectionCard(
                      title: 'Información del cliente',
                      icon: Icons.person_outline_rounded,
                      child: Form(
                        key: controller.formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: controller.nameCtrl,
                              decoration: InputDecoration(
                                labelText: 'Nombre completo *',
                                hintText: 'Ej: Juan Pérez',
                                prefixIcon: const Icon(Icons.person_outline),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              validator: (v) => (v == null || v.trim().isEmpty)
                                  ? 'El nombre es obligatorio'
                                  : null,
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: controller.dniCtrl,
                                    decoration: InputDecoration(
                                      labelText: 'Documento',
                                      hintText: 'Ej: 1234567890',
                                      prefixIcon: const Icon(
                                        Icons.badge_outlined,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: TextFormField(
                                    controller: controller.guestsCtrl,
                                    decoration: InputDecoration(
                                      labelText: 'Personas *',
                                      hintText: 'Ej: 4',
                                      prefixIcon: const Icon(
                                        Icons.group_outlined,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    keyboardType: TextInputType.number,
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: controller.emailCtrl,
                              decoration: InputDecoration(
                                labelText: 'Email (opcional)',
                                hintText: 'ejemplo@correo.com',
                                prefixIcon: const Icon(Icons.email_outlined),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              keyboardType: TextInputType.emailAddress,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: controller.phoneCtrl,
                              decoration: InputDecoration(
                                labelText: 'Teléfono (opcional)',
                                hintText: '+57 300 123 4567',
                                prefixIcon: const Icon(Icons.phone_outlined),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              keyboardType: TextInputType.phone,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: controller.notesCtrl,
                              decoration: InputDecoration(
                                labelText: 'Notas adicionales',
                                hintText:
                                    'Comentarios o solicitudes especiales',
                                prefixIcon: const Icon(Icons.notes_outlined),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                alignLabelWithHint: true,
                              ),
                              maxLines: 3,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Schedule Section
                    _SectionCard(
                      title: 'Horario de la reserva',
                      icon: Icons.schedule_rounded,
                      child: Column(
                        children: [
                          _DateTimeCard(
                            label: 'Inicio',
                            value: controller.start.value,
                            onTap: () => _pickStart(context, controller),
                            color: cs.primaryContainer,
                            iconColor: cs.onPrimaryContainer,
                          ),
                          const SizedBox(height: 12),
                          _DateTimeCard(
                            label: 'Fin',
                            value: controller.end.value,
                            onTap: () => _pickEnd(context, controller),
                            color: cs.secondaryContainer,
                            iconColor: cs.onSecondaryContainer,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: FilledButton.icon(
                        onPressed: controller.saving.value
                            ? null
                            : () => _submit(context, controller),
                        icon: controller.saving.value
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.check_circle_outline),
                        label: Text(
                          controller.saving.value
                              ? 'Guardando...'
                              : 'Crear reserva',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: FilledButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: cs.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: textTheme.titleMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _DateTimeCard extends StatelessWidget {
  final String label;
  final DateTime value;
  final VoidCallback onTap;
  final Color color;
  final Color iconColor;

  const _DateTimeCard({
    required this.label,
    required this.value,
    required this.onTap,
    required this.color,
    required this.iconColor,
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
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
          borderRadius: BorderRadius.circular(12),
          color: cs.surface,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.event_rounded, color: iconColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: textTheme.labelMedium?.copyWith(
                      color: cs.onSurfaceVariant,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${df.format(value)} · ${tf.format(value)}',
                    style: textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: cs.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}
