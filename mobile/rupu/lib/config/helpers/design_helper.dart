import 'package:flutter/material.dart';

class SectionTitle extends StatelessWidget {
  const SectionTitle(
    this.text, {
    super.key,
    this.trailing,
    this.padding = const EdgeInsets.symmetric(horizontal: 4),
  });

  final String text;
  final Widget? trailing;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    final title = Text(
      text,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: tt.titleMedium!.copyWith(
        fontWeight: FontWeight.w800,
        color: cs.onSurface,
      ),
    );

    return Padding(
      padding: padding,
      child: LayoutBuilder(
        builder: (context, constraints) {
          // ¿El padre me dio ancho finito?
          final hasWidth =
              constraints.hasBoundedWidth && constraints.maxWidth.isFinite;

          if (!hasWidth) {
            // ⚠️ Unbounded: NO usar width: infinity ni Expanded/Flexible.
            // Damos un ancho máximo razonable usando el ancho de pantalla.
            final screenW = MediaQuery.sizeOf(context).width;
            return ConstrainedBox(
              constraints: BoxConstraints(maxWidth: screenW - 32),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Expanded(child: title),
                  if (trailing != null) ...[
                    const SizedBox(width: 8),
                    trailing!,
                  ],
                ],
              ),
            );
          }

          // ✅ Bounded: layout normal
          return Row(
            mainAxisSize: MainAxisSize.max,
            children: [
              Expanded(child: title),
              if (trailing != null) ...[const SizedBox(width: 8), trailing!],
            ],
          );
        },
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

enum StatusTone { info, success, warning, danger }

class StatusBadge extends StatelessWidget {
  const StatusBadge(this.text, {super.key, this.tone = StatusTone.info});

  final String text;
  final StatusTone tone;

  @override
  Widget build(BuildContext context) {
    final palette = _paletteFor(tone);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: palette.bg, // 🎨 color fijo (no del tema)
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        // Usamos la tipografía del tema (para coherencia), pero el color es fijo
        style:
            Theme.of(context).textTheme.labelMedium?.copyWith(
              color: palette.fg,
              fontWeight: FontWeight.w600,
            ) ??
            TextStyle(
              color: palette.fg,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
      ),
    );
  }

  _BadgeColors _paletteFor(StatusTone t) {
    switch (t) {
      case StatusTone.success:
        // Verde suave
        return const _BadgeColors(bg: Color(0xFFE6F4EA), fg: Color(0xFF0F5132));
      case StatusTone.warning:
        // Ámbar suave
        return const _BadgeColors(bg: Color(0xFFFFF4E5), fg: Color(0xFF7A4F01));
      case StatusTone.danger:
        // Rojo suave
        return const _BadgeColors(bg: Color(0xFFFFE5E5), fg: Color(0xFF842029));
      case StatusTone.info:
        // Azul suave
        return const _BadgeColors(bg: Color(0xFFE7F1FF), fg: Color(0xFF084298));
    }
  }
}

class _BadgeColors {
  const _BadgeColors({required this.bg, required this.fg});
  final Color bg;
  final Color fg;
}

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
