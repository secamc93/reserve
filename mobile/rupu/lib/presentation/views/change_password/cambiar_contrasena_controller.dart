// presentation/views/cambiar_contrasena/cambiar_contrasena_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import 'package:rupu/domain/infrastructure/datasources/change_password_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/change_password_repository_impl.dart';
import 'package:rupu/domain/repositories/change_password_repository.dart';

/// Controlador para la vista de cambio de contraseña.
class ChangePasswordController extends GetxController {
  final ChangePasswordRepository repository;

  ChangePasswordController()
    : repository = ChangePasswordRepositoryImpl(ChangePasswordDatasourceImpl());

  final formKey = GlobalKey<FormState>();
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final repeatPasswordController = TextEditingController();

  final isLoading = false.obs;
  final RxnString errorMessage = RxnString();
  final RxnString successMessage = RxnString();

  /// Ejecuta la lógica de cambio de contraseña.
  Future<bool> submit() async {
    if (!formKey.currentState!.validate()) return false;
    if (newPasswordController.text != repeatPasswordController.text) {
      errorMessage.value =
          'La nueva contraseña y la confirmación no coinciden.';
      return false;
    }

    isLoading.value = true;
    errorMessage.value = null;
    successMessage.value = null;

    try {
      final response = await repository.changePassword(
        currentPassword: currentPasswordController.text.trim(),
        newPassword: newPasswordController.text.trim(),
      );
      successMessage.value = response.message;
      return true;
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg;
      if (data is Map<String, dynamic>) {
        msg =
            data['error']?.toString() ??
            data['details']?.toString() ??
            'Error desconocido';
      } else {
        msg = e.message ?? '';
      }
      errorMessage.value = msg;
      return false;
    } catch (e) {
      errorMessage.value = 'Error inesperado: $e';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  void clearFields() {
    currentPasswordController.clear();
    newPasswordController.clear();
    repeatPasswordController.clear();
  }

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    repeatPasswordController.dispose();
    super.onClose();
  }
}
