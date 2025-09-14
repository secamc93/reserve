import 'package:flutter/material.dart';
import 'package:rupu/presentation/widgets/widgets.dart';

class HeaderCard extends StatelessWidget {
  const HeaderCard({
    super.key,
    required this.name,
    required this.email,
    required this.bannerUrl,
    required this.initial,
  });

  final String name;
  final String email;
  final String bannerUrl;
  final String initial;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return SizedBox(
      height: 150,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (bannerUrl.isNotEmpty)
              Image.network(
                bannerUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(color: cs.surface),
              )
            else
              Container(color: cs.surface),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    cs.surface.withValues(alpha: .75),
                    cs.surface.withValues(alpha: .75),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  InitialAvatar(initial: initial, size: 64),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: tt.titleLarge!.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (email.trim().isNotEmpty)
                          Text(
                            email,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: tt.bodyMedium!.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.bold,
                            ),
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
