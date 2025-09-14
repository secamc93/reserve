import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';

class QuickActionsStrip extends StatelessWidget {
  const QuickActionsStrip({
    super.key,
    required this.onNew,
    required this.onCalendar,
    required this.onCheckIn,
    required this.onClients,
  });

  final VoidCallback onNew;
  final VoidCallback onCalendar;
  final VoidCallback onCheckIn;
  final VoidCallback onClients;

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Nueva', Icons.add_circle_outline, onNew),
      ('Calendario', Icons.event_outlined, onCalendar),
      // ('Check-in', Icons.how_to_reg_outlined, onCheckIn),
      ('Clientes', Icons.person_outline, onClients),
    ];

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        padding: const EdgeInsets.symmetric(horizontal: 2),
        itemBuilder: (_, i) {
          final (label, icon, handler) = items[i];
          return _QuickCard(label: label, icon: icon, onTap: handler);
        },
      ),
    );
  }
}

class _QuickCard extends StatelessWidget {
  const _QuickCard({required this.label, required this.icon, this.onTap});
  final String label;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(18),
            child: Ink(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest.withValues(alpha: .35),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: cs.outlineVariant.withValues(alpha: .5),
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [
                            cs.primary.withValues(alpha: .14),
                            cs.secondary.withValues(alpha: .12),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: .06),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Icon(icon, color: cs.primary),
                    ),
                    const SizedBox(height: 10),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Text(
                        label,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: tt.labelLarge!.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: .2,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
