import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'package:rupu/presentation/screens/home/home_screen.dart';
import 'package:rupu/presentation/screens/login/login_screen.dart';

import '../login/login_controller.dart';

class BusinessSelectorController extends GetxController {
  BusinessSelectorController();

  final LoginController _loginController = Get.find<LoginController>();

  final RxnInt selectedBusinessId = RxnInt();
  final RxnString errorMessage = RxnString();

  List<BusinessModel> get businesses =>
      _loginController.sessionModel.value?.data.businesses ?? const <BusinessModel>[];

  String get userName => _loginController.sessionModel.value?.data.user.name ?? '';

  bool get hasSession => _loginController.sessionModel.value != null;

  bool get canContinue => selectedBusinessId.value != null;

  @override
  void onInit() {
    super.onInit();
    if (businesses.length == 1) {
      selectedBusinessId.value = businesses.first.id;
    }
  }

  @override
  void onReady() {
    super.onReady();
    final context = Get.context;
    if (context == null) return;

    if (!hasSession) {
      GoRouter.of(context).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
      return;
    }

    if (businesses.length == 1) {
      final business = businesses.first;
      _loginController.selectBusiness(business);
      GoRouter.of(context).goNamed(
        HomeScreen.name,
        pathParameters: {'page': '0'},
      );
    }
  }

  void selectBusiness(int businessId) {
    errorMessage.value = null;
    final business = _findBusinessById(businessId);
    if (business == null) {
      errorMessage.value = 'No fue posible cargar la información del negocio seleccionado.';
      return;
    }
    selectedBusinessId.value = businessId;
  }

  Future<void> confirmSelection(BuildContext context) async {
    final id = selectedBusinessId.value;
    if (id == null) {
      errorMessage.value = 'Selecciona un negocio para continuar.';
      return;
    }

    final business = _findBusinessById(id);
    if (business == null) {
      errorMessage.value = 'No fue posible cargar la información del negocio seleccionado.';
      return;
    }

    _loginController.selectBusiness(business);

    if (!context.mounted) return;

    GoRouter.of(context).goNamed(
      HomeScreen.name,
      pathParameters: {'page': '0'},
    );
  }

  void goBackToLogin() {
    final context = Get.context;
    if (context == null) return;
    GoRouter.of(context).goNamed(
      LoginScreen.name,
      pathParameters: {'page': '0'},
    );
  }

  BusinessModel? _findBusinessById(int id) {
    for (final business in businesses) {
      if (business.id == id) return business;
    }
    return null;
  }
}
