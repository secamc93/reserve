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
      case 2:
        context.go('/home/0/ajustes');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    final items = const <_NavItem>[
      _NavItem(
        icon: Icons.home_outlined,
        selectedIcon: Icons.home_rounded,
        label: 'Inicio',
      ),
      _NavItem(
        icon: Icons.person_outline_rounded,
        selectedIcon: Icons.person_rounded,
        label: 'Perfil',
      ),
      _NavItem(
        icon: Icons.settings_outlined,
        selectedIcon: Icons.settings_rounded,
        label: 'Ajustes',
      ),
    ];

    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            height: 76,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  cs.surface.withValues(alpha: 0.85),
                  cs.surface.withValues(alpha: 0.75),
                ],
              ),
              border: Border.all(
                color: cs.outlineVariant.withValues(alpha: 0.2),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(items.length, (i) {
                final it = items[i];
                final selected = i == currentIndex;
                return _NavButton(
                  item: it,
                  selected: selected,
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
  const _NavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
  });
  final IconData icon;
  final IconData selectedIcon;
  final String label;
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = selected ? cs.primary : cs.onSurfaceVariant;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutQuint,
        padding: EdgeInsets.symmetric(
          horizontal: selected ? 20 : 16,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: selected
              ? cs.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              selected ? item.selectedIcon : item.icon,
              color: color,
              size: 26,
            ),
            const SizedBox(height: 4),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                letterSpacing: 0.3,
                fontFamily: 'Inter', // Ensuring consistent font if available
              ),
              child: Text(item.label),
            ),
          ],
        ),
      ),
    );
  }
}
