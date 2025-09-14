import 'package:flutter/material.dart';

class ConfirmRow extends StatelessWidget {
  const ConfirmRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: 8),
        Text(
          label,
          style: tt.labelMedium!.copyWith(color: cs.onSurfaceVariant),
        ),
        const SizedBox(width: 60),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
            style: tt.bodyMedium!.copyWith(fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}
