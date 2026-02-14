import 'dart:io' show Platform;
import 'dart:ui' show ImageFilter;
import 'package:cupertino_native/cupertino_native.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/screens/home/home_screen.dart';

class CustomBottomNavigation extends StatelessWidget {
  const CustomBottomNavigation({super.key, required this.currentIndex});

  final int currentIndex;

  void _onItemTapped(BuildContext context, int index) {
    debugPrint('🔵 BottomNav tapped: index=$index, current=$currentIndex');

    // Always navigate using go() for consistent behavior
    switch (index) {
      case 0:
        debugPrint('🏠 Navigating to /home/0');
        // Force navigation to root of home branch
        context.goNamed(HomeScreen.name, pathParameters: {'page': '0'});
        break;
      case 1:
        debugPrint('👤 Navigating to /home/0/perfil');
        context.go('/home/0/perfil');
        break;
      case 2:
        debugPrint('⚙️ Navigating to /home/0/ajustes');
        context.go('/home/0/ajustes');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    // iOS: Native Liquid Glass CNTabBar, Android: Material NavigationBar
    if (Platform.isIOS) {
      return _buildCupertinoNativeTabBar(context);
    }
    return _buildMaterialNavigation(context);
  }

  /// iOS Native Liquid Glass Tab Bar using cupertino_native package
  /// Wrapped in a Stack to capture taps on the "Inicio" tab when it's already selected.
  Widget _buildCupertinoNativeTabBar(BuildContext context) {
    return Stack(
      children: [
        CNTabBar(
          items: const [
            CNTabBarItem(label: 'Inicio', icon: CNSymbol('house.fill')),
            CNTabBarItem(label: 'Perfil', icon: CNSymbol('person.crop.circle')),
            CNTabBarItem(label: 'Ajustes', icon: CNSymbol('gearshape.fill')),
          ],
          currentIndex: currentIndex,
          onTap: (index) {
            // This might not be called due to the overlay, which is intentional.
            // We handle taps manually in the overlay below.
          },
        ),
        Positioned.fill(
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: () => _onItemTapped(context, 0),
                  child: Container(color: Colors.transparent),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: () => _onItemTapped(context, 1),
                  child: Container(color: Colors.transparent),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: () => _onItemTapped(context, 2),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Android Material 3 NavigationBar with blur effect
  Widget _buildMaterialNavigation(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
        child: Container(
          padding: EdgeInsets.fromLTRB(
            16,
            0,
            16,
            bottomPadding > 0 ? bottomPadding : 10,
          ),
          decoration: BoxDecoration(
            color: cs.surface.withValues(alpha: 0.85),
            border: Border(
              top: BorderSide(
                color: cs.outlineVariant.withValues(alpha: 0.15),
                width: 0.5,
              ),
            ),
          ),
          child: SizedBox(
            height: 65,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _NavButton(
                  icon: Icons.home_outlined,
                  selectedIcon: Icons.home_rounded,
                  label: 'Inicio',
                  selected: currentIndex == 0,
                  onTap: () => _onItemTapped(context, 0),
                ),
                _NavButton(
                  icon: Icons.person_outline_rounded,
                  selectedIcon: Icons.person_rounded,
                  label: 'Perfil',
                  selected: currentIndex == 1,
                  onTap: () => _onItemTapped(context, 1),
                ),
                _NavButton(
                  icon: Icons.settings_outlined,
                  selectedIcon: Icons.settings_rounded,
                  label: 'Ajustes',
                  selected: currentIndex == 2,
                  onTap: () => _onItemTapped(context, 2),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
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
            Icon(selected ? selectedIcon : icon, color: color, size: 26),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
