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
  final RxBool isProcessing = false.obs;

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
      Future.microtask(() => confirmSelection(context));
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
      _showError(context, errorMessage.value!);
      return;
    }

    final business = _findBusinessById(id);
    if (business == null) {
      errorMessage.value = 'No fue posible cargar la información del negocio seleccionado.';
      _showError(context, errorMessage.value!);
      return;
    }

    if (isProcessing.value) return;

    isProcessing.value = true;
    bool activated = false;

    try {
      activated = await _loginController.activateBusinessSession(business);
    } finally {
      isProcessing.value = false;
    }

    if (!activated) {
      final message = _loginController.errorMessage.value ??
          'No fue posible activar el negocio seleccionado.';
      errorMessage.value = message;
      if (context.mounted) {
        _showError(context, message);
      }
      return;
    }

    errorMessage.value = null;

    if (!context.mounted) return;

    GoRouter.of(context).goNamed(
      HomeScreen.name,
      pathParameters: {'page': '0'},
    );
  }

  void goBackToLogin(BuildContext context) {
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

  void _showError(BuildContext context, String message) {
    if (message.isEmpty || !context.mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(message)),
      );
  }
}
