// presentation/views/business_selector/widgets/business_card.dart
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'initial_avatar.dart';

class BusinessCard extends StatelessWidget {
  const BusinessCard({
    super.key,
    required this.business,
    required this.selected,
    required this.onTap,
  });

  final BusinessModel business;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    final hasLogo = business.logoUrl.trim().isNotEmpty;

    return DecoratedBox(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .06),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          if (selected)
            BoxShadow(
              color: cs.primary.withValues(alpha: .12),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Material(
          color: cs.surface,
          child: InkWell(
            onTap: onTap,
            child: Stack(
              children: [
                // Fondo con logo
                if (hasLogo)
                  Positioned.fill(
                    child: Image.network(
                      business.logoUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                    ),
                  ),

                // Scrim oscuro para contraste
                if (hasLogo)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: .55),
                            Colors.black.withValues(alpha: .40),
                          ],
                        ),
                      ),
                    ),
                  ),

                // Blur suave
                if (hasLogo)
                  Positioned.fill(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 3.5, sigmaY: 3.5),
                      child: const SizedBox.expand(),
                    ),
                  ),

                // Borde + glass sutil encima
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: selected ? cs.primary : cs.outlineVariant,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      color: cs.surface.withValues(alpha: hasLogo ? .10 : 1),
                    ),
                  ),
                ),

                // Contenido
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      InitialAvatar(
                        text: business.name.trim().isEmpty
                            ? '?'
                            : business.name
                                  .trim()
                                  .characters
                                  .first
                                  .toUpperCase(),
                        size: 56,
                      ),
                      const SizedBox(width: 12),

                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // título + dot
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    business.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: tt.titleMedium!.copyWith(
                                      fontWeight: FontWeight.w800,
                                      // importante: texto claro sobre scrim
                                      color: hasLogo ? Colors.white : null,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                _SelectionDot(selected: selected),
                              ],
                            ),
                            const SizedBox(height: 6),

                            if (business.description.isNotEmpty)
                              Text(
                                business.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: tt.bodySmall!.copyWith(
                                  color: hasLogo
                                      ? Colors.white.withValues(alpha: .90)
                                      : cs.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),

                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  Icons.place_outlined,
                                  size: 16,
                                  color: hasLogo
                                      ? Colors.white70
                                      : cs.onSurfaceVariant,
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    business.address,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: tt.bodySmall!.copyWith(
                                      color: hasLogo
                                          ? Colors.white.withValues(alpha: .92)
                                          : cs.onSurfaceVariant,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 10),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                _FeatureChip(
                                  label: business.businessType.name,
                                  bg: (hasLogo ? Colors.white : cs.primary)
                                      .withValues(alpha: .12),
                                  fg: hasLogo ? Colors.white : cs.primary,
                                ),
                                if (business.enableReservations)
                                  _FeatureChip(
                                    label: 'Reservas',
                                    bg: (hasLogo ? Colors.white : cs.tertiary)
                                        .withValues(alpha: .12),
                                    fg: hasLogo ? Colors.white : cs.tertiary,
                                  ),
                                if (business.enableDelivery)
                                  _FeatureChip(
                                    label: 'Delivery',
                                    bg: (hasLogo ? Colors.white : cs.secondary)
                                        .withValues(alpha: .12),
                                    fg: hasLogo ? Colors.white : cs.secondary,
                                  ),
                                if (business.enablePickup)
                                  _FeatureChip(
                                    label: 'Pickup',
                                    bg:
                                        (hasLogo
                                                ? Colors.white
                                                : cs.primaryContainer)
                                            .withValues(alpha: .24),
                                    fg: hasLogo
                                        ? Colors.white
                                        : cs.onPrimaryContainer,
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  const _FeatureChip({required this.label, required this.bg, required this.fg});
  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: ShapeDecoration(
        color: bg,
        shape: StadiumBorder(
          side: BorderSide(color: fg.withValues(alpha: .25)),
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall!.copyWith(
          color: fg,
          fontWeight: FontWeight.w800,
          letterSpacing: .2,
        ),
      ),
    );
  }
}

class _SelectionDot extends StatelessWidget {
  const _SelectionDot({required this.selected});
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: selected ? cs.primary : cs.onSurfaceVariant,
          width: 2,
        ),
        color: selected ? cs.primary : Colors.transparent,
      ),
      child: selected ? Icon(Icons.check, size: 12, color: cs.onPrimary) : null,
    );
  }
}
