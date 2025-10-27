import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/change_password_datasource.dart';
import 'package:rupu/domain/infrastructure/models/change_password_response_model.dart';

/// DataSource para cambiar contraseña usando un Dio autenticado.
class ChangePasswordDatasourceImpl extends CambiarContrasenasDatasource {
  final Dio _dio;

  ChangePasswordDatasourceImpl({String? baseUrl})
    : _dio = AuthenticatedDio(
        baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1/auth',
      ).dio;

  @override
  Future changePassword({String? currentPassword, String? newPassword}) async {
    debugPrint(
      'Petición change-password: current=$currentPassword, new=$newPassword',
    );
    try {
      final response = await _dio.post(
        '/change-password',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
        },
      );

      return ChangePasswordResponseModel.fromJson(
        response.data as Map<String, dynamic>,
      );
    } on DioException catch (e) {
      debugPrint(
        'Error change-password [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }
}
