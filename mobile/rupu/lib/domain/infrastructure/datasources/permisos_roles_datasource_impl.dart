import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/permisos_roles_datasource.dart';
import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/mappers/permisos_roles_mapper.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

/// DataSource para cambiar contraseña usando un Dio autenticado.
class PermisosRolesDatasourceImpl extends PermisosRolesDatasource {
  final Dio _dio;

  PermisosRolesDatasourceImpl({String? baseUrl})
    : _dio = AuthenticatedDio(
        baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1/auth',
      ).dio;

  @override
  Future<RolesPermisos> obtenerRolesPermisos() async {
    try {
      final response = await _dio.get(
        '/roles-permissions',
        queryParameters: {"business_id": 1},
      );

      final model = PermisosRolesResponseModel.fromJson(
        response.data as Map<String, dynamic>,
      );

      return PermisosRolesMapper.responseToEntity(model);
    } on DioException catch (e) {
      debugPrint(
        'Error obtener roles y permisos [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }
}
