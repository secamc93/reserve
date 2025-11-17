import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/roles_datasource.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/infrastructure/mappers/permisos_roles_mapper.dart';
import 'package:rupu/domain/infrastructure/mappers/roles_mapper.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';
import 'package:rupu/domain/infrastructure/models/roles_list_response_model.dart';

class RolesDatasourceImpl extends RolesDatasource {
  final Dio _dio;

  RolesDatasourceImpl({String? baseUrl})
    : _dio = AuthenticatedDio(
        baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
      ).dio;

  @override
  Future<RolesCatalog> obtenerRoles() async {
    try {
      final response = await _dio.get('/roles');

      final data = Map<String, dynamic>.from(response.data as Map);
      final model = RolesListResponseModel.fromJson(data);

      return RolesMapper.listToEntity(model);
    } on DioException catch (e) {
      debugPrint(
        'Error obtener roles [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }

  Role _roleFromJson(Map<String, dynamic> json) {
    final model = RoleModel.fromJson(json);
    return PermisosRolesMapper.roleFromModel(model);
  }

  @override
  Future<RoleActionResult> crearRol(Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post('/roles', data: payload);
      final data = Map<String, dynamic>.from(response.data as Map);
      final roleJson = data['data'] as Map<String, dynamic>? ?? const {};
      final role = _roleFromJson(roleJson);
      final message = data['message']?.toString() ?? 'Rol creado exitosamente';
      final success = data['success'] as bool? ?? true;
      return RoleActionResult(success: success, message: message, role: role);
    } on DioException catch (e) {
      debugPrint('Error creando rol: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<RoleActionResult> actualizarRol(
    int id,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.put('/roles/$id', data: payload);
      final data = Map<String, dynamic>.from(response.data as Map);
      final roleJson = data['data'] as Map<String, dynamic>? ?? const {};
      final role = _roleFromJson(roleJson);
      final message =
          data['message']?.toString() ?? 'Rol actualizado exitosamente';
      final success = data['success'] as bool? ?? true;
      return RoleActionResult(success: success, message: message, role: role);
    } on DioException catch (e) {
      debugPrint('Error actualizando rol: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<IamMessageResult> eliminarRol(int id) async {
    try {
      final response = await _dio.delete('/roles/$id');
      final data = Map<String, dynamic>.from(response.data as Map);
      final success = data['success'] as bool? ?? true;
      final message =
          data['message']?.toString() ?? 'Rol eliminado exitosamente';
      return IamMessageResult(success: success, message: message);
    } on DioException catch (e) {
      debugPrint('Error eliminando rol: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<List<int>> obtenerPermisosAsignados(int roleId) async {
    try {
      final response = await _dio.get('/roles/$roleId/permissions');
      final data = Map<String, dynamic>.from(response.data as Map);
      final permissions = data['permissions'];
      if (permissions is List) {
        return permissions
            .whereType<Map>()
            .map((perm) => (perm['id'] as num?)?.toInt() ?? 0)
            .where((id) => id > 0)
            .toList();
      }
      return const [];
    } on DioException catch (e) {
      debugPrint('Error obteniendo permisos del rol: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<IamMessageResult> asignarPermisos(
    int roleId,
    List<int> permissionIds,
  ) async {
    try {
      final response = await _dio.post(
        '/roles/$roleId/permissions',
        data: {'permission_ids': permissionIds},
      );
      final data = Map<String, dynamic>.from(response.data as Map);
      final success = data['success'] as bool? ?? true;
      final message =
          data['message']?.toString() ?? 'Permisos asignados exitosamente';
      return IamMessageResult(success: success, message: message);
    } on DioException catch (e) {
      debugPrint('Error asignando permisos: ${e.message}');
      rethrow;
    }
  }

  @override
  Future<IamMessageResult> eliminarPermiso(int roleId, int permissionId) async {
    try {
      final response = await _dio.delete(
        '/roles/$roleId/permissions/$permissionId',
      );
      final data = Map<String, dynamic>.from(response.data as Map);
      final success = data['success'] as bool? ?? true;
      final message =
          data['message']?.toString() ?? 'Permiso eliminado exitosamente';
      return IamMessageResult(success: success, message: message);
    } on DioException catch (e) {
      debugPrint('Error eliminando permiso: ${e.message}');
      rethrow;
    }
  }
}
