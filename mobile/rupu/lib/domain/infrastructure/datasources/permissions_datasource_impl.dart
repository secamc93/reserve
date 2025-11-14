import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/permissions_datasource.dart';
import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/iam_resource.dart' show IamMessageResult;
import 'package:rupu/domain/infrastructure/mappers/permissions_mapper.dart';
import 'package:rupu/domain/infrastructure/mappers/permisos_roles_mapper.dart';
import 'package:rupu/domain/infrastructure/models/permissions_list_response_model.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermissionsDatasourceImpl extends PermissionsDatasource {
  final Dio _dio;

  PermissionsDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<PermissionsCatalog> obtenerPermisos() async {
    try {
      final response = await _dio.get('/permissions');

      final data = Map<String, dynamic>.from(response.data as Map);
      final model = PermissionsListResponseModel.fromJson(data);

      return PermissionsMapper.listToEntity(model);
    } on DioException catch (e) {
      debugPrint(
        'Error obtener permisos [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }

  Permission _permissionFromJson(Map<String, dynamic> json) {
    final model = PermissionModel.fromJson(json);
    return PermisosRolesMapper.permissionFromModel(model);
  }

  @override
  Future<PermissionActionResult> crearPermiso(
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.post('/permissions', data: payload);
      final data = Map<String, dynamic>.from(response.data as Map);
      final permissionJson = data['data'] as Map<String, dynamic>? ?? const {};
      final permission =
          permissionJson.isEmpty ? null : _permissionFromJson(permissionJson);
      final success = data['success'] as bool? ?? true;
      final message = data['message']?.toString() ?? 'Permiso creado exitosamente';
      return PermissionActionResult(
        success: success,
        message: message,
        permission: permission,
      );
    } on DioException catch (e) {
      debugPrint('Error creando permiso: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<IamMessageResult> actualizarPermiso(
    int id,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.put('/permissions/$id', data: payload);
      final data = Map<String, dynamic>.from(response.data as Map);
      final success = data['success'] as bool? ?? true;
      final message = data['message']?.toString() ?? 'Permiso actualizado exitosamente';
      return IamMessageResult(success: success, message: message);
    } on DioException catch (e) {
      debugPrint('Error actualizando permiso: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<IamMessageResult> eliminarPermiso(int id) async {
    try {
      final response = await _dio.delete('/permissions/$id');
      final data = Map<String, dynamic>.from(response.data as Map);
      final success = data['success'] as bool? ?? true;
      final message = data['message']?.toString() ?? 'Permiso eliminado exitosamente';
      return IamMessageResult(success: success, message: message);
    } on DioException catch (e) {
      debugPrint('Error eliminando permiso: ${e.message}');
      rethrow;
    }
  }
}
