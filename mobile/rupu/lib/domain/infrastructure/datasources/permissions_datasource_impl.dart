import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/permissions_datasource.dart';
import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/infrastructure/mappers/permissions_mapper.dart';
import 'package:rupu/domain/infrastructure/models/permissions_list_response_model.dart';

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
}
