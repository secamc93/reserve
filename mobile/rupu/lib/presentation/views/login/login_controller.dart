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
      final session = await repository.getUser(
        email: emailController.text.trim().toLowerCase(),
        password: passwordController.text,
      );

      sessionModel.value = session;
      selectedBusiness.value = null;

      await TokenStorage().saveToken(session.data.token);

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

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
