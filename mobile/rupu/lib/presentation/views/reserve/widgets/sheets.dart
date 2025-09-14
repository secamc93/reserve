// presentation/views/calendar/widgets/sheets.dart
import 'package:flutter/material.dart';

Future<String?> showCancelReasonSheet(BuildContext context) async {
  return showModalBottomSheet<String>(
    context: context,
    useSafeArea: true,
    isScrollControlled: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
    ),
    builder: (ctx) {
      final cs = Theme.of(ctx).colorScheme;
      final reasonCtrl = TextEditingController();
      return Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 10,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        cs.error.withOpacity(.12),
                        cs.errorContainer.withOpacity(.10),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.cancel_outlined, color: cs.error),
                ),
                const SizedBox(width: 10),
                Text(
                  'Cancelar reserva',
                  style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '¿Deseas cancelar esta reserva? Puedes indicar un motivo (opcional).',
              style: Theme.of(
                ctx,
              ).textTheme.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Motivo (opcional)',
                hintText: 'Ej: cliente no podrá asistir',
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(ctx).pop(null),
                  child: const Text('Volver'),
                ),
                const Spacer(),
                FilledButton.tonal(
                  style: FilledButton.styleFrom(
                    foregroundColor: cs.error,
                    backgroundColor: cs.error.withOpacity(.08),
                  ),
                  onPressed: () => Navigator.of(ctx).pop(reasonCtrl.text),
                  child: const Text('Confirmar cancelación'),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}

Future<bool?> showConfirmCheckInSheet(BuildContext context) {
  return showModalBottomSheet<bool>(
    context: context,
    useSafeArea: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
    ),
    builder: (ctx) {
      final cs = Theme.of(ctx).colorScheme;
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        cs.primary.withOpacity(.12),
                        cs.primaryContainer.withOpacity(.10),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.how_to_reg, color: cs.primary),
                ),
                const SizedBox(width: 10),
                Text(
                  'Confirmar check-in',
                  style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '¿Deseas marcar esta reserva como confirmada?',
              style: Theme.of(
                ctx,
              ).textTheme.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(ctx).pop(false),
                  child: const Text('Volver'),
                ),
                const Spacer(),
                FilledButton.tonal(
                  style: FilledButton.styleFrom(
                    foregroundColor: cs.primary,
                    backgroundColor: cs.primary.withOpacity(.08),
                  ),
                  onPressed: () => Navigator.of(ctx).pop(true),
                  child: const Text('Confirmar'),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}

Future<void> showCheckInSheet(BuildContext context) async {
  final theme = Theme.of(context);
  final cs = theme.colorScheme;
  final tt = theme.textTheme;
  if (!context.mounted) return;
  await showModalBottomSheet(
    context: context,
    useSafeArea: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
    ),
    builder: (sheetCtx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: cs.primaryContainer,
                  child: Icon(
                    Icons.check_rounded,
                    color: cs.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Check-in realizado',
                  style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'La reserva se confirmó correctamente.',
                style: tt.bodyMedium,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.of(sheetCtx).pop(),
              child: const Text('Listo'),
            ),
          ],
        ),
      );
    },
  );
}

Future<void> showCancelledSheet(BuildContext context) async {
  final theme = Theme.of(context);
  final cs = theme.colorScheme;
  final tt = theme.textTheme;
  if (!context.mounted) return;

  await showModalBottomSheet(
    context: context,
    useSafeArea: true,
    showDragHandle: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
    ),
    builder: (sheetCtx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: cs.primaryContainer,
                  child: Icon(
                    Icons.check_rounded,
                    color: cs.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Reserva cancelada',
                  style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'La reserva se canceló correctamente.',
                style: tt.bodyMedium,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.of(sheetCtx).pop(),
              child: const Text('Listo'),
            ),
          ],
        ),
      );
    },
  );
}
