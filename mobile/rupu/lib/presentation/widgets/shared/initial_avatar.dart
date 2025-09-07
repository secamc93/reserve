// ——— Avatar con inicial
import 'package:flutter/material.dart';

class InitialAvatar extends StatelessWidget {
  const InitialAvatar({super.key, required this.initial, this.size = 48});
  final String initial;
  final double size;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [cs.primary, cs.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: Colors.white.withValues(alpha: .95),
          width: 3,
        ),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withValues(alpha: .20),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: Theme.of(context).textTheme.titleMedium!.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: 18,
        ),
      ),
    );
  }
}
