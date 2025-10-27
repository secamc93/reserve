// ——— Pill de estado suave
import 'package:flutter/material.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';

class SoftStatusPill extends StatelessWidget {
  const SoftStatusPill({super.key, required this.text, required this.tone});
  final String text;
  final Tone tone;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    Color fg;
    switch (tone) {
      case Tone.success:
        fg = const Color(0xFF0F5132);
        break;
      case Tone.warning:
        fg = const Color(0xFF7A4F01);
        break;
      case Tone.danger:
        fg = cs.error;
        break;
      case Tone.info:
        fg = const Color(0xFF084298);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: ShapeDecoration(
        color: fg.withValues(alpha: .12),
        shape: StadiumBorder(
          side: BorderSide(color: fg.withValues(alpha: .22)),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(fontWeight: FontWeight.w800, color: fg, fontSize: 12),
      ),
    );
  }
}
