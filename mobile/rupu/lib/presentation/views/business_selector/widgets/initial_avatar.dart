// presentation/views/business_selector/widgets/initial_avatar.dart
import 'package:flutter/material.dart';

class InitialAvatar extends StatelessWidget {
  const InitialAvatar({super.key, required this.text, this.size = 56});

  final String text;
  final double size;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

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
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: Text(
            text,
            style: tt.headlineSmall!.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }
}
