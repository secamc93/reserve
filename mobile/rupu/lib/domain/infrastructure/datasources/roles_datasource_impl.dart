import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/roles_datasource.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/infrastructure/mappers/roles_mapper.dart';
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
}
