import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import 'package:rupu/domain/infrastructure/datasources/cambiar_contrasena_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/cambiar_contrasena_repository_impl.dart';
import 'package:rupu/domain/repositories/cambiar_contrasena_repository.dart';

/// Controlador para la vista de cambio de contraseña.
class CambiarContrasenaController extends GetxController {
  final CambiarContrasenaRepository repository;

  CambiarContrasenaController()
    : repository = CambiarContrasenaRepositoryImpl(
        CambiarContrasenaDatasourceImpl(),
      );

  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  final TextEditingController currentPasswordController =
      TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController repeatPasswordController =
      TextEditingController();

  final RxBool isLoading = false.obs;
  final RxnString errorMessage = RxnString();
  final RxnString successMessage = RxnString();

  /// Ejecuta la lógica de cambio de contraseña.
  /// Retorna true si fue exitoso y false en caso de error.
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
      final response = await repository.cambiarContrasena(
        currentPassword: currentPasswordController.text.trim(),
        newPassword: newPasswordController.text.trim(),
      );
      successMessage.value = response.message;
      return true;
    } on DioException catch (e) {
      // Extraer mensaje de error del JSON: campo 'error' o 'details'
      final data = e.response?.data;
      String msg;
      if (data is Map<String, dynamic>) {
        msg =
            data['error']?.toString() ??
            data['details']?.toString() ??
            'Error desconocido';
      } else {
        msg = e.message ?? "";
      }
      errorMessage.value = msg;
      return false;
    } catch (e) {
      errorMessage.value = 'Error inesperado: ${e.toString()}';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    repeatPasswordController.dispose();
    super.onClose();
  }
}
