// presentation/views/business_selector/widgets/business_card.dart

import 'package:flutter/material.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'initial_avatar.dart';

import 'package:rupu/config/helpers/design_helper.dart';

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

    return GlassContainer(
      borderRadius: BorderRadius.circular(24),
      blur: 15,
      opacity: 0.8,
      border: Border.all(
        color: selected ? cs.primary : cs.outlineVariant.withValues(alpha: 0.3),
        width: selected ? 2 : 1,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Fondo con logo
            if (hasLogo)
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.network(
                    business.logoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              ),

            // Scrim oscuro para contraste si hay logo
            if (hasLogo)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: .60),
                        Colors.black.withValues(alpha: .45),
                      ],
                    ),
                  ),
                ),
              ),

            // Contenido
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  InitialAvatar(
                    text: business.name.trim().isEmpty
                        ? '?'
                        : business.name.trim().characters.first.toUpperCase(),
                    size: 56,
                  ),
                  const SizedBox(width: 16),

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
                            _SelectionDot(selected: selected, isDark: hasLogo),
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

                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: [
                            _FeatureChip(
                              label: business.businessType.name,
                              bg: (hasLogo ? Colors.white : cs.primary)
                                  .withValues(alpha: .15),
                              fg: hasLogo ? Colors.white : cs.primary,
                            ),
                            if (business.enableReservations)
                              _FeatureChip(
                                label: 'Reservas',
                                bg: (hasLogo ? Colors.white : cs.tertiary)
                                    .withValues(alpha: .15),
                                fg: hasLogo ? Colors.white : cs.tertiary,
                              ),
                            if (business.enableDelivery)
                              _FeatureChip(
                                label: 'Delivery',
                                bg: (hasLogo ? Colors.white : cs.secondary)
                                    .withValues(alpha: .15),
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
  const _SelectionDot({required this.selected, required this.isDark});
  final bool selected;
  final bool isDark;

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
          color: selected
              ? cs.primary
              : (isDark ? Colors.white70 : cs.onSurfaceVariant),
          width: 2,
        ),
        color: selected ? cs.primary : Colors.transparent,
      ),
      child: selected ? Icon(Icons.check, size: 12, color: cs.onPrimary) : null,
    );
  }
}
