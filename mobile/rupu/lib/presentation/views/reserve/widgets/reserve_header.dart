import 'package:flutter/material.dart';

class ReserveHeader extends StatelessWidget {
  const ReserveHeader({
    super.key,
    required this.totalToday,
    required this.onNew,
    required this.onCalendar,
  });

  final int totalToday;
  final VoidCallback onNew;
  final VoidCallback onCalendar;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cs.primary.withValues(alpha: .10),
            cs.secondary.withValues(alpha: .08),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Agenda de hoy',
                  style: tt.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  totalToday == 0
                      ? 'No hay reservas registradas.'
                      : '$totalToday reserva${totalToday == 1 ? '' : 's'} programada${totalToday == 1 ? '' : 's'}.',
                  style: tt.bodyMedium!.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton.icon(
                      onPressed: onNew,
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Nueva reserva'),
                    ),
                    OutlinedButton.icon(
                      onPressed: onCalendar,
                      icon: const Icon(Icons.event_outlined),
                      label: const Text(
                        'Calendario',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
    );
  }
}
