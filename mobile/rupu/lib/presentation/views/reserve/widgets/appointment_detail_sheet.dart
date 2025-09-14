// presentation/views/calendar/widgets/appointment_detail_sheet.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import '../../../widgets/shared/initial_avatar.dart';
import '../../../widgets/shared/soft_status_pill.dart';
import '../../../widgets/shared/icon_chip.dart';
import 'package:rupu/config/helpers/calendar_helper.dart'; // parseSubject, parseNotes, toneFor, normalizeStatus, safeInitial

Future<void> showAppointmentDetailSheet({
  required BuildContext context,
  required Appointment appt,
  required int pageIndex,
  required VoidCallback onEdit,
  required Future<void> Function() onCancel,
  required Future<void> Function() onCheckIn,
}) async {
  final (cliente, estado) = parseSubject(appt.subject);
  final isCancelled = estado.toLowerCase().contains('cancel');
  final tone = toneFor(estado);
  final meta = parseNotes(appt.notes ?? '');

  final locale = 'es';
  final day = DateFormat('EEE d MMM', locale).format(appt.startTime);
  final startHM = DateFormat('HH:mm', locale).format(appt.startTime);
  final endHM = DateFormat('HH:mm', locale).format(appt.endTime);

  final theme = Theme.of(context);
  final cs = theme.colorScheme;
  final tt = theme.textTheme;

  final pill = FilledButton.styleFrom(
    shape: const StadiumBorder(),
    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
    textStyle: const TextStyle(fontWeight: FontWeight.w800),
  );

  await showModalBottomSheet(
    context: context,
    useSafeArea: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Detalle',
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                InkWell(
                  onTap: () => Navigator.of(ctx).pop(),
                  borderRadius: BorderRadius.circular(16),
                  child: Ink(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest.withValues(alpha: .5),
                      border: Border.all(color: cs.outlineVariant),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close_rounded, size: 18),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                InitialAvatar(initial: safeInitial(cliente), size: 44),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '$cliente • ${estado.isEmpty ? "Pendiente" : estado}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                SoftStatusPill(text: normalizeStatus(estado), tone: tone),
              ],
            ),
            const SizedBox(height: 12),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                IconChip(icon: Icons.event_outlined, label: day),
                IconChip(icon: Icons.schedule, label: '$startHM – $endHM'),
                if (meta.mesa != null && meta.mesa!.isNotEmpty)
                  IconChip(
                    icon: Icons.table_bar_outlined,
                    label: 'Mesa ${meta.mesa}',
                  ),
              ],
            ),

            if ((meta.negocio ?? '').isNotEmpty || (meta.tel ?? '').isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  [
                    if ((meta.negocio ?? '').isNotEmpty)
                      'Negocio: ${meta.negocio}',
                    if ((meta.tel ?? '').isNotEmpty) 'Tel: ${meta.tel}',
                  ].join('   •   '),
                  style: tt.bodyMedium!.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

            const SizedBox(height: 14),
            const Divider(height: 1),
            const SizedBox(height: 12),

            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.tonal(
                        style: pill.copyWith(
                          backgroundColor: WidgetStatePropertyAll(
                            cs.surfaceContainerHighest,
                          ),
                          foregroundColor: WidgetStatePropertyAll(cs.onSurface),
                        ),
                        onPressed: isCancelled
                            ? null
                            : () {
                                Navigator.of(ctx).pop();
                                onEdit();
                              },
                        child: const Text('Editar'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton.tonal(
                        style: pill.copyWith(
                          backgroundColor: WidgetStatePropertyAll(
                            cs.errorContainer,
                          ),
                          foregroundColor: WidgetStatePropertyAll(
                            cs.onErrorContainer,
                          ),
                        ),
                        onPressed: isCancelled
                            ? null
                            : () async {
                                Navigator.of(ctx).pop();
                                await onCancel();
                              },
                        child: const Text('Cancelar'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                FilledButton(
                  style: pill.copyWith(
                    backgroundColor: WidgetStatePropertyAll(cs.primary),
                    foregroundColor: WidgetStatePropertyAll(cs.onPrimary),
                  ),
                  onPressed: isCancelled
                      ? null
                      : () async {
                          Navigator.of(ctx).pop();
                          await onCheckIn();
                        },
                  child: const Text('Check-in'),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}
