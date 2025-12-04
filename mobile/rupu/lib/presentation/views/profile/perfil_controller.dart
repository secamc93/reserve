// controller/perfil_controller.dart
import 'dart:math';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

import '../home/home_controller.dart';
import '../login/login_controller.dart';

import '../users/user_detail_view.dart';
import '../../screens/screens.dart';

class PerfilController extends GetxController {
  final AppThemeController _themeCtrl = Get.find<AppThemeController>();
  final LoginController _loginCtrl = Get.find<LoginController>();

  // ---- Estado expuesto a la vista ----
  String userName = '';
  String email = '';
  String avatarUrl = '';

  int userId = 0;

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
      userId = user.id;
      userName = user.name;
      email = user.email;
      avatarUrl = user.avatarUrl;
      randomIndex = Random().nextInt(100).toString();

      final initialBusiness =
          _loginCtrl.selectedBusiness.value ??
          (session.data.businesses.isNotEmpty
              ? session.data.businesses.first
              : null);
      _setBusiness(initialBusiness);
    } else {
      userId = 0;
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

  void goToBusinessSelector(BuildContext context) {
    GoRouter.of(context).pushNamed(BusinessSelectorScreen.name);
  }

  Future<void> updateUserData(BuildContext context) async {
    if (userId == 0) return;

    final result = await GoRouter.of(context).pushNamed(
      UserDetailView.name,
      pathParameters: {'page': '0', 'id': '$userId'},
      queryParameters: {'mode': 'profile'}, // Hide administrative fields
    );

    if (result != null && context.mounted) {
      // TODO: Refresh session data
    }
  }

  Future<void> confirmLogout(BuildContext context) async {
    final result = await DialogHelper.showBlurredDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que quieres cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              'Cerrar sesión',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );

    if (result == true && context.mounted) {
      await logout(context);
    }
  }

  Future<void> logout(BuildContext context) async {
    HomeBinding.register();
    final home = Get.isRegistered<HomeController>()
        ? Get.find<HomeController>()
        : null;

    await _loginCtrl.logout();
    home?.resetForLogout();

    if (context.mounted) {
      GoRouter.of(
        context,
      ).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
    }
  }

  @override
  void onClose() {
    _sessionWorker?.dispose();
    _businessWorker?.dispose();
    super.onClose();
  }
}
