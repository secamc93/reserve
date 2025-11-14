import 'package:dio/dio.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/iam_datasource.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_actions_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_business_types_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_businesses_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_resources_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_users_response_model.dart';

class IamDatasourceImpl extends IamDatasource {
  final Dio _dio;

  IamDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<IamUsersResponseModel> getUsers({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get('/users', queryParameters: _clean(query));
    return IamUsersResponseModel.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  @override
  Future<IamResourcesResponseModel> getResources({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get('/resources', queryParameters: _clean(query));
    return IamResourcesResponseModel.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  @override
  Future<IamBusinessTypesResponseModel> getBusinessTypes({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get('/business-types', queryParameters: _clean(query));
    return IamBusinessTypesResponseModel.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  @override
  Future<IamBusinessesResponseModel> getBusinesses({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get('/businesses', queryParameters: _clean(query));
    return IamBusinessesResponseModel.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  @override
  Future<IamActionsResponseModel> getActions({Map<String, dynamic>? query}) async {
    final response =
        await _dio.get('/actions', queryParameters: _clean(query));
    return IamActionsResponseModel.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  @override
  Future<Map<String, dynamic>> createResource(Map<String, dynamic> data) async {
    final response = await _dio.post('/resources', data: data);
    return Map<String, dynamic>.from(response.data as Map);
  }

  @override
  Future<Map<String, dynamic>> updateResource(
    int id,
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.put('/resources/$id', data: data);
    return Map<String, dynamic>.from(response.data as Map);
  }

  @override
  Future<Map<String, dynamic>> deleteResource(int id) async {
    final response = await _dio.delete('/resources/$id');
    return Map<String, dynamic>.from(response.data as Map);
  }

  Map<String, dynamic>? _clean(Map<String, dynamic>? query) {
    if (query == null) return null;
    final map = Map<String, dynamic>.from(query);
    map.removeWhere(
      (key, value) => value == null || (value is String && value.isEmpty),
    );
    return map.isEmpty ? null : map;
  }
}
