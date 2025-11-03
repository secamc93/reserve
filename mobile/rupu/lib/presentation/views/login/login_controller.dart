import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';
import 'package:rupu/domain/infrastructure/datasources/user_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'package:rupu/domain/infrastructure/repositories/user_repository_impl.dart';
import 'package:rupu/domain/repositories/user_repository.dart';

class LoginController extends GetxController {
  final UserRepository repository;
  LoginController() : repository = UserRepositoryImpl(UserDatasource());

  final formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final Rxn<LoginResponseModel> sessionModel = Rxn();
  final Rxn<BusinessModel> selectedBusiness = Rxn();

  /// Ejecuta login y devuelve si fue exitoso.
  Future<bool> submit() async {
    if (!formKey.currentState!.validate()) return false;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      await TokenStorage().clearAllTokens();
      final session = await repository.getUser(
        email: emailController.text.trim().toLowerCase(),
        password: passwordController.text,
      );

      sessionModel.value = session;
      selectedBusiness.value = null;

      final loginToken = session.data.token;
      if (loginToken.isNotEmpty) {
        await TokenStorage().saveLoginToken(loginToken);
      }

      return true;
    } on DioException catch (e) {
      errorMessage.value = (e.response?.statusCode == 401)
          ? 'Email o contraseña incorrectos.'
          : 'Error: ${e.message}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Limpia los campos de email y contraseña.
  void clearFields() {
    emailController.clear();
    passwordController.clear();
    sessionModel.value = null;
    selectedBusiness.value = null;
  }

  Future<void> logout() async {
    await TokenStorage().clearAllTokens();
    clearFields();
  }

  void selectBusiness(BusinessModel business) {
    selectedBusiness.value = business;
    AppTheme.instance.updateColors(
      business.primaryColor,
      business.secondaryColor,
    );
  }

  List<BusinessModel> get businesses =>
      sessionModel.value?.data.businesses ?? const <BusinessModel>[];

  int? get selectedBusinessId => selectedBusiness.value?.id;

  bool get isSuperAdmin => sessionModel.value?.data.isSuperAdmin ?? false;

  Future<bool> activateBusinessSession(BusinessModel business) async {
    final loginToken = sessionModel.value?.data.token;
    if (loginToken == null || loginToken.isEmpty) {
      errorMessage.value =
          'No se encontró un token de autenticación válido para la sesión actual.';
      return false;
    }

    errorMessage.value = null;

    try {
      final businessToken = await repository.getBusinessToken(
        token: loginToken,
        businessId: isSuperAdmin ? 0 : business.id,
      );

      await TokenStorage().saveBusinessToken(businessToken);
      selectBusiness(business);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _resolveDioMessage(
        e,
        'No fue posible activar el negocio seleccionado.',
      );
      return false;
    } catch (_) {
      errorMessage.value =
          'No fue posible activar el negocio seleccionado.';
      return false;
    }
  }

  Future<bool> activateSuperAdminSession() async {
    final loginToken = sessionModel.value?.data.token;
    if (loginToken == null || loginToken.isEmpty) {
      errorMessage.value =
          'No se encontró un token de autenticación válido para la sesión actual.';
      return false;
    }

    errorMessage.value = null;

    try {
      final businessToken = await repository.getBusinessToken(
        token: loginToken,
        businessId: 0,
      );

      await TokenStorage().saveBusinessToken(businessToken);
      selectedBusiness.value = null;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _resolveDioMessage(
        e,
        'No fue posible completar la sesión del super administrador.',
      );
      return false;
    } catch (_) {
      errorMessage.value =
          'No fue posible completar la sesión del super administrador.';
      return false;
    }
  }

  String _resolveDioMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final messageCandidate = data['message'] ?? data['error'];
      if (messageCandidate is String && messageCandidate.isNotEmpty) {
        return messageCandidate;
      }
    }
    return fallback;
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
