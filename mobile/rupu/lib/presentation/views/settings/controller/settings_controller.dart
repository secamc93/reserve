// presentation/views/settings/settings_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

import '../views/create_user_view.dart';

class SettingsController extends GetxController {
  final AppThemeController _themeCtrl = Get.find<AppThemeController>();
  final HomeController _homeCtrl = Get.find<HomeController>();

  RxBool get isDarkRx => _themeCtrl.isDark;
  bool get isAdmin => _homeCtrl.isSuper;

  void toggleTheme() => _themeCtrl.toggleTheme();

  void goToCreateUser(BuildContext context, int pageIndex) {
    if (!isAdmin) return;
    GoRouter.of(context)
        .pushNamed(CreateUserView.name, pathParameters: {'page': '$pageIndex'});
  }
}
