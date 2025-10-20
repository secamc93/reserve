import 'package:dio/dio.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_properties_response_model.dart';
import 'package:rupu/domain/infrastructure/models/simple_response_model.dart';

class HorizontalPropertiesDatasourceImpl extends HorizontalPropertiesDatasource {
  final Dio _dio;

  HorizontalPropertiesDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<HorizontalPropertiesResponseModel> getHorizontalProperties({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties',
      queryParameters: query,
    );
    return HorizontalPropertiesResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalProperty({required int id}) async {
    final response = await _dio.delete('/horizontal-properties/$id');
    return SimpleResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
