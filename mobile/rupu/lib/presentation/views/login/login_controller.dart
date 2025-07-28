import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';
import 'package:rupu/domain/infrastructure/datasources/user_datasource.dart';
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

  /// Ejecuta login y devuelve si fue exitoso.
  Future<bool> submit() async {
    if (!formKey.currentState!.validate()) return false;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final session = await repository.getUser(
        email: emailController.text.trim(),
        password: passwordController.text,
      );

      sessionModel.value = session;

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

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
