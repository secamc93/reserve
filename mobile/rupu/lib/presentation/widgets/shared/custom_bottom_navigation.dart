// lib/presentation/widgets/custom_bottom_navigation.dart
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CustomBottomNavigation extends StatelessWidget {
  const CustomBottomNavigation({super.key, required this.currentIndex});

  final int currentIndex;

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home/0');
        break;
      case 1:
        context.go('/home/0/perfil');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    final items = const <_NavItem>[
      _NavItem(icon: Icons.home_max, label: 'Inicio'),
      _NavItem(icon: Icons.person, label: 'Perfil'),
    ];

    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            height: 72,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              color: cs.surface.withValues(alpha: .90),
              border: Border.all(color: cs.outline.withValues(alpha: .06)),
              boxShadow: [
                BoxShadow(
                  color: cs.shadow.withValues(alpha: .25),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(items.length, (i) {
                final it = items[i];
                final selected = i == currentIndex;
                return _NavButton(
                  item: it,
                  selected: selected,
                  activeColor: cs.primary,
                  inactiveColor: cs.onSurfaceVariant,
                  accentColor: cs.primary,
                  onTap: () => _onItemTapped(context, i),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({required this.icon, required this.label});
  final IconData icon;
  final String label;
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
    required this.activeColor,
    required this.inactiveColor,
    required this.accentColor,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;
  final Color activeColor;
  final Color inactiveColor;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final color = selected ? activeColor : inactiveColor;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      splashColor: accentColor.withValues(alpha: .06),
      highlightColor: accentColor.withValues(alpha: .04),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              item.icon,
              color: color,
              size: selected ? 26 : 24, // sin barrita; sutil énfasis con tamaño
            ),
            const SizedBox(height: 6),
            Text(
              item.label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                letterSpacing: .2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
