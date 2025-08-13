// controller/perfil_controller.dart
import 'dart:math';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';

import '../login/login_controller.dart';
import '../../screens/screens.dart';

class PerfilController extends GetxController {
  final AppThemeController _themeCtrl = Get.find<AppThemeController>();
  final LoginController _loginCtrl = Get.find<LoginController>();

  // ---- Estado expuesto a la vista ----
  late final String userName;
  late final String email;
  late final String avatarUrl;

  late final String businessName;
  late final String businessLogoUrl;
  late final String businessDescription;
  late final String businessAddress;
  late final int businessId;

  // Para placeholder de avatar (quedó en el controller)
  late final String randomIndex;

  // Tema (reactivo)
  RxBool get isDarkRx => _themeCtrl.isDark;

  @override
  void onInit() {
    super.onInit();

    final session = _loginCtrl.sessionModel.value!;
    final user = session.data.user;
    final negocio = session.data.businesses.first;

    userName = user.name;
    email = user.email;
    avatarUrl = user.avatarUrl;

    businessName = negocio.name;
    businessLogoUrl = negocio.logoUrl;
    businessDescription = negocio.description;
    businessAddress = negocio.address;
    businessId = negocio.id;

    randomIndex = Random().nextInt(100).toString();
  }

  // ---- Acciones para la vista ----
  void toggleTheme() => _themeCtrl.toggleTheme();

  void goToChangePassword(BuildContext context) {
    GoRouter.of(
      context,
    ).pushNamed(CambiarContrasenaScreen.name, pathParameters: {'page': '0'});
  }

  void logout(BuildContext context) {
    GoRouter.of(
      context,
    ).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
    _loginCtrl.clearFields();
  }
}
