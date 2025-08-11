import 'package:flutter/material.dart';

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.trailing});
  final String text;
  final Widget? trailing;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(
            text,
            style: Theme.of(
              context,
            ).textTheme.titleMedium!.copyWith(fontWeight: FontWeight.w700),
          ),
          const Spacer(),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class PrimaryCard extends StatelessWidget {
  const PrimaryCard({super.key, required this.child, this.onTap});
  final Widget child;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final content = Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black..withValues(alpha: 0.5),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: child,
    );
    if (onTap == null) return content;
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: content,
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge(this.text, {super.key, this.tone = StatusTone.info});
  final String text;
  final StatusTone tone;
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    Color bg;
    Color fg;
    switch (tone) {
      case StatusTone.success:
        bg = cs.secondaryContainer;
        fg = cs.onSecondaryContainer;
        break;
      case StatusTone.warning:
        bg = Colors.amber.shade100;
        fg = Colors.brown.shade800;
        break;
      case StatusTone.danger:
        bg = Colors.red.shade100;
        fg = Colors.red.shade800;
        break;
      default:
        bg = cs.primaryContainer;
        fg = cs.onPrimaryContainer;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelMedium!.copyWith(
          color: fg,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

enum StatusTone { info, success, warning, danger }

class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key, required this.value});
  final double value; // 0..1
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        height: 8,
        child: Stack(
          children: [
            Container(color: cs.surfaceContainerHighest.withValues(alpha: 0.5)),
            FractionallySizedBox(
              widthFactor: value,
              child: Container(color: cs.primary),
            ),
          ],
        ),
      ),
    );
  }
}
