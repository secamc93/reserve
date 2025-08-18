import 'package:flutter/material.dart';
import 'package:rupu/config/helpers/design_helper.dart' show StatusTone;

class PremiumReserveCard extends StatelessWidget {
  const PremiumReserveCard({
    super.key,
    required this.client,
    required this.subtitle,
    required this.time,
    required this.status,
    required this.tone,
    required this.logoUrl,
    this.onTap,
    this.onCancel,
    this.showCta = true,
    this.ctaText = 'Ver detalle',
  });

  final String client;
  final String subtitle;
  final String time;
  final String status;
  final StatusTone tone;
  final String logoUrl;

  final VoidCallback? onTap;
  final VoidCallback? onCancel;

  final bool showCta;
  final String ctaText;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final initial = client.trim().isEmpty
        ? '•'
        : client.trim().substring(0, 1).toUpperCase();

    final (bg, fg) = _toneColors(tone);

    return DecoratedBox(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .08),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Material(
          color: cs.surface,
          child: InkWell(
            onTap: onTap,
            child: SizedBox(
              // ↓ un poco menos alta (antes 230)
              height: 215,
              child: Stack(
                children: [
                  // Fondo con logo del negocio
                  Positioned.fill(
                    child: logoUrl.trim().isNotEmpty
                        ? Image.network(
                            logoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                Container(color: cs.surface),
                          )
                        : Container(color: cs.surface),
                  ),

                  // Scrim más oscuro para legibilidad (↑ opacidad)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: .15),
                            Colors.black.withValues(alpha: .45),
                            Colors.black.withValues(alpha: .70),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Top: inicial + pill + menú
                  Positioned(
                    top: 12,
                    left: 12,
                    right: 12,
                    child: Row(
                      children: [
                        _InitialAvatar(initial: initial),
                        const Spacer(),
                        _SoftStatusPill(text: status, bg: bg, fg: fg),
                        const SizedBox(width: 8),
                        if (onCancel != null)
                          _OverflowMenu(onCancel: onCancel!),
                      ],
                    ),
                  ),

                  // Contenido inferior
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 14,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          client,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: tt.titleLarge!.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            height: 1.05,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          subtitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: tt.bodyMedium!.copyWith(
                            color: Colors.white.withValues(alpha: .88),
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _MetaChip(icon: Icons.schedule, label: time),
                            const SizedBox(width: 8),
                            _MetaChip(
                              icon: Icons.confirmation_num_outlined,
                              label: 'Reserva',
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (showCta)
                          _CtaButton(text: ctaText, onPressed: onTap),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  (Color, Color) _toneColors(StatusTone t) {
    switch (t) {
      case StatusTone.success:
        return (const Color(0xFFE6F4EA), const Color(0xFF0F5132));
      case StatusTone.warning:
        return (const Color(0xFFFFF4E5), const Color(0xFF7A4F01));
      case StatusTone.danger:
        return (const Color(0xFFFFE5E5), const Color(0xFF842029));
      case StatusTone.info:
        return (const Color(0xFFE7F1FF), const Color(0xFF084298));
    }
  }
}

class _InitialAvatar extends StatelessWidget {
  const _InitialAvatar({required this.initial});
  final String initial;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [cs.primary, cs.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withValues(alpha: .25),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: Colors.white, width: 3),
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: Theme.of(context).textTheme.titleMedium!.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _SoftStatusPill extends StatelessWidget {
  const _SoftStatusPill({
    required this.text,
    required this.bg,
    required this.fg,
  });
  final String text;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withValues(alpha: .22)),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelMedium!.copyWith(
          color: fg,
          fontWeight: FontWeight.w800,
          letterSpacing: .2,
        ),
      ),
    );
  }
}

class _OverflowMenu extends StatelessWidget {
  const _OverflowMenu({required this.onCancel});
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return PopupMenuButton<String>(
      tooltip: 'Más acciones',
      offset: const Offset(0, 36),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      icon: Icon(Icons.more_horiz, color: Colors.white.withValues(alpha: .95)),
      onSelected: (v) {
        if (v == 'cancel') onCancel();
      },
      itemBuilder: (_) => [
        PopupMenuItem(
          value: 'cancel',
          child: Row(
            children: [
              Icon(Icons.block, color: cs.error),
              const SizedBox(width: 8),
              Text('Cancelar', style: TextStyle(color: cs.error)),
            ],
          ),
        ),
      ],
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 220),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .14),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: .18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.schedule, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelMedium!.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CtaButton extends StatelessWidget {
  const _CtaButton({required this.text, this.onPressed});
  final String text;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    // Botón blanco con texto negro para contrastar siempre (dark/light)
    return SizedBox(
      height: 44, // un pelín más compacto
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        child: Text(
          text,
          style: Theme.of(context).textTheme.titleSmall!.copyWith(
            fontWeight: FontWeight.w900,
            color: Colors.black, // ← fijo para contraste en dark mode
          ),
        ),
      ),
    );
  }
}
