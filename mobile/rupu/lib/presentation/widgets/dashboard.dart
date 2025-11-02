import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/config/menu/menu_item.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/screens/horizontal_properties/horizontal_properties_screen.dart';
import 'package:rupu/presentation/screens/reserve/reserve_screen.dart';
import 'package:rupu/presentation/screens/users/users_screen.dart';
import 'package:rupu/presentation/screens/users_permissions/users_permissions_screen.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

class DashBoard extends GetView<HomeController> {
  const DashBoard({super.key, required this.pageIndex});

  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final items = controller.accessibleMenuItems;
      if (items.isEmpty) {
        if (controller.isSuper) {
          final fallbackItems = List<MenuItem>.of(appMenuItems);
          final defaultMenu =
              controller.defaultMenuItem.value ?? fallbackItems.first;
          return _DashboardModule(
            pageIndex: pageIndex,
            menuItem: defaultMenu,
          );
        }
        return const _WelcomeMessage();
      }

      final defaultMenu = controller.defaultMenuItem.value ?? items.first;
      return _DashboardModule(
        pageIndex: pageIndex,
        menuItem: defaultMenu,
      );
    });
  }
}

class _DashboardModule extends StatelessWidget {
  const _DashboardModule({
    required this.pageIndex,
    required this.menuItem,
  });

  final int pageIndex;
  final MenuItem menuItem;

  @override
  Widget build(BuildContext context) {
    final link = menuItem.link;

    if (link.contains('/horizontal-properties')) {
      HorizontalPropertiesBinding.register();
      return HorizontalPropertiesScreen(pageIndex: pageIndex);
    }

    if (link.contains('/users-permissions')) {
      RolesPermissionsBinding.register();
      return UsersPermissionsScreen(pageIndex: pageIndex);
    }

    if (link.contains('/users')) {
      UsersBinding.register();
      return UsersScreen(pageIndex: pageIndex);
    }

    if (link.contains('/reserve')) {
      ReserveBinding.register();
      return ReserveScreen(pageIndex: pageIndex);
    }

    return const _WelcomeMessage();
  }
}

class _WelcomeMessage extends StatelessWidget {
  const _WelcomeMessage();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.home_outlined,
            size: 64,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Bienvenidos a Rupü',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Selecciona un módulo desde el menú lateral para comenzar.',
            style: theme.textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
