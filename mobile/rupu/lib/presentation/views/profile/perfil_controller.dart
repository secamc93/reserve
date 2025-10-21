// controller/perfil_controller.dart
import 'dart:math';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

import '../home/home_controller.dart';
import '../login/login_controller.dart';
import '../../screens/screens.dart';

class PerfilController extends GetxController {
  final AppThemeController _themeCtrl = Get.find<AppThemeController>();
  final LoginController _loginCtrl = Get.find<LoginController>();

  // ---- Estado expuesto a la vista ----
  String userName = '';
  String email = '';
  String avatarUrl = '';

  final Rxn<BusinessModel> _business = Rxn();
  Worker? _businessWorker;
  Worker? _sessionWorker;

  String get businessName => _business.value?.name ?? '';
  String get businessLogoUrl => _business.value?.logoUrl ?? '';
  String get businessDescription => _business.value?.description ?? '';
  String get businessAddress => _business.value?.address ?? '';
  int get businessId => _business.value?.id ?? 0;

  // Para placeholder de avatar (quedó en el controller)
  String randomIndex = Random().nextInt(100).toString();

  // Tema (reactivo)
  RxBool get isDarkRx => _themeCtrl.isDark;

  @override
  void onInit() {
    super.onInit();

    _applySession(_loginCtrl.sessionModel.value);
    _sessionWorker = ever<LoginResponseModel?>(
      _loginCtrl.sessionModel,
      _applySession,
    );
    _businessWorker = ever(_loginCtrl.selectedBusiness, _setBusiness);
  }

  void _applySession(LoginResponseModel? session) {
    if (session != null) {
      final user = session.data.user;
      userName = user.name;
      email = user.email;
      avatarUrl = user.avatarUrl;
      randomIndex = Random().nextInt(100).toString();

      final initialBusiness = _loginCtrl.selectedBusiness.value ??
          (session.data.businesses.isNotEmpty
              ? session.data.businesses.first
              : null);
      _setBusiness(initialBusiness);
    } else {
      userName = '';
      email = '';
      avatarUrl = '';
      randomIndex = Random().nextInt(100).toString();
      _setBusiness(null);
    }
  }

  void _setBusiness(BusinessModel? business) {
    _business.value = business;
    update();
  }

  // ---- Acciones para la vista ----
  void toggleTheme() => _themeCtrl.toggleTheme();

  void goToChangePassword(BuildContext context) {
    GoRouter.of(
      context,
    ).pushNamed(CambiarContrasenaScreen.name, pathParameters: {'page': '0'});
  }

  Future<void> logout(BuildContext context) async {
    HomeBinding.register();
    await _loginCtrl.logout();
    if (context.mounted) {
      GoRouter.of(
        context,
      ).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
    }

    Future.microtask(() {
      if (Get.isRegistered<HomeController>()) {
        Get.delete<HomeController>();
      }
    });
  }

  @override
  void onClose() {
    _sessionWorker?.dispose();
    _businessWorker?.dispose();
    super.onClose();
  }
}
