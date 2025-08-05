import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/menu/menu_item.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class SideMenu extends StatefulWidget {
  final GlobalKey<ScaffoldState> scaffoldKey;
  const SideMenu({super.key, required this.scaffoldKey});

  @override
  State<SideMenu> createState() => _SideMenuState();
}

class _SideMenuState extends State<SideMenu> {
  int navDrawerIndex = 0;

  @override
  Widget build(BuildContext context) {
    final hasNotch = MediaQuery.of(context).viewPadding.top > 35;
    final totalItems = appMenuItems.length;
    final firstCount = min(totalItems, 3);
    final firstGroup = appMenuItems.sublist(0, firstCount);
    final secondGroup = firstCount < totalItems
        ? appMenuItems.sublist(firstCount)
        : <MenuItem>[];

    return NavigationDrawer(
      selectedIndex: navDrawerIndex,
      onDestinationSelected: (value) async {
        setState(() {
          navDrawerIndex = value;
        });
        if (value < totalItems) {
          final menuItem = appMenuItems[value];
          context.push(menuItem.link);
        } else {
          // Cerrar sesión
          await TokenStorage().deleteToken();
          if (Get.isRegistered<LoginController>()) {
            Get.delete<LoginController>();
          }
          if (context.mounted) {
            context.go('/login/0');
          }
        }
        widget.scaffoldKey.currentState?.closeDrawer();
      },
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(28, hasNotch ? 0 : 20, 16, 10),
          child: const Text('Home'),
        ),
        ...firstGroup.map(
          (item) => NavigationDrawerDestination(
            icon: Icon(item.icon),
            label: Text(item.tittle),
          ),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(28, 16, 28, 10),
          child: Divider(),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(28, 10, 16, 10),
          child: const Text('Más opciones'),
        ),
        ...secondGroup.map(
          (item) => NavigationDrawerDestination(
            icon: Icon(item.icon),
            label: Text(item.tittle),
          ),
        ),

        const Padding(
          padding: EdgeInsets.fromLTRB(28, 16, 28, 10),
          child: Divider(),
        ),
        // Logout al final
        const NavigationDrawerDestination(
          icon: Icon(Icons.logout),
          label: Text('Cerrar sesión'),
        ),
      ],
    );
  }
}
