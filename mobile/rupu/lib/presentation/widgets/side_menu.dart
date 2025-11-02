import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/config/menu/menu_item.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class SideMenu extends StatefulWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;
  const SideMenu({super.key, required this.scaffoldKey});

  @override
  State<SideMenu> createState() => _SideMenuState();
}

class _SideMenuState extends State<SideMenu> {
  int navDrawerIndex = 0;

  Future<void> _handleSelection(
    BuildContext context,
    int index,
    List<MenuItem> menuItems,
  ) async {
    final totalItems = menuItems.length;

    if (index >= 0 && index < totalItems) {
      final item = menuItems[index];
      context.push(item.link);
    } else {
      HomeBinding.register();
      final home = Get.isRegistered<HomeController>()
          ? Get.find<HomeController>()
          : null;

      if (Get.isRegistered<LoginController>()) {
        await Get.find<LoginController>().logout();
      } else {
        await TokenStorage().clearAllTokens();
      }

      home?.resetForLogout();

      if (context.mounted) {
        context.go('/login/0');
      }
    }

    widget.scaffoldKey.currentState?.closeDrawer();
  }

  ({List<MenuItem> first, List<MenuItem> second}) _groups(
    List<MenuItem> items,
  ) {
    final total = items.length;
    final firstCount = min(total, 3);
    final first = items.sublist(0, firstCount);
    final second = firstCount < total
        ? items.sublist(firstCount)
        : <MenuItem>[];
    return (first: first, second: second);
  }

  Widget _buildMenu(
    BuildContext context,
    List<MenuItem> menuItems,
  ) {
    final cs = Theme.of(context).colorScheme;
    final groups = _groups(menuItems);

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        _headerBrand(context),
        if (groups.first.isEmpty && groups.second.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Text(
              'No hay módulos disponibles para tu perfil.',
              style: TextStyle(color: cs.onSurfaceVariant),
            ),
          ),
        ..._buildDenseTiles(context, groups.first, 0, menuItems),
        if (groups.second.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Más opciones',
              style: TextStyle(color: cs.onSurfaceVariant),
            ),
          ),
        ..._buildDenseTiles(
          context,
          groups.second,
          groups.first.length,
          menuItems,
        ),
        ListTile(
          dense: true,
          leading: const Icon(Icons.logout),
          title: const Text('Cerrar sesión'),
          onTap: () => _handleSelection(context, menuItems.length, menuItems),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final home = Get.isRegistered<HomeController>()
        ? Get.find<HomeController>()
        : null;

    if (home == null) {
      return Drawer(
        child: SafeArea(
          child: _buildMenu(context, appMenuItems),
        ),
      );
    }

    return Drawer(
      child: SafeArea(
        child: Obx(() {
          final menuItems = home.accessibleMenuItems.toList(growable: false);
          if (menuItems.isEmpty && home.isSuper) {
            return _buildMenu(context, appMenuItems);
          }
          return _buildMenu(context, menuItems);
        }),
      ),
    );
  }

  Widget _headerBrand(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: cs.primaryContainer,
            child: Icon(
              Icons.store_mall_directory_outlined,
              size: 20,
              color: cs.onPrimaryContainer,
            ),
          ),
          const SizedBox(width: 10),
          const Text(
            'Rupü',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDenseTiles(
    BuildContext context,
    List<MenuItem> items,
    int offset,
    List<MenuItem> fullList,
  ) {
    final cs = Theme.of(context).colorScheme;

    return List.generate(items.length, (i) {
      final idx = offset + i;
      final selected = navDrawerIndex == idx;
      final it = items[i];

      // Resalte sutil sin divisores: icono y texto con color primario cuando está seleccionado
      return InkWell(
        onTap: () {
          setState(() => navDrawerIndex = idx);
          _handleSelection(context, idx, fullList);
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: BoxDecoration(
            color: selected
                ? cs.primaryContainer.withValues(alpha: .35)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 8),
            leading: Icon(
              it.icon,
              color: selected ? cs.primary : cs.onSurfaceVariant,
            ),
            title: Text(
              it.tittle,
              style: TextStyle(
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? cs.primary : null,
              ),
            ),
            // Sin trailing/chevrons para mantenerlo limpio y compacto
          ),
        ),
      );
    });
  }
}
