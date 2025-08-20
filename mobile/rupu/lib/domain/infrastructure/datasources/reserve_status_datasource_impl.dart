import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/reserve_status_datasource.dart';
import 'package:rupu/domain/entities/reserve_status.dart';
import 'package:rupu/domain/infrastructure/mappers/reserve_status_mapper.dart';
import 'package:rupu/domain/infrastructure/models/reserve_status_response_model.dart';

class ReserveStatusDatasourceImpl extends ReserveStatusDatasource {
  final Dio _dio;

  ReserveStatusDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<List<ReserveStatus>> obtenerEstados() async {
    try {
      final resp = await _dio.get('/reserves/status');
      final model = ReserveStatusResponseModel.fromJson(
        resp.data as Map<String, dynamic>,
      );
      return model.data.map(ReserveStatusMapper.fromModel).toList();
    } on DioException catch (e) {
      debugPrint('Error obtener estados [${e.response?.statusCode}]: '
          '${e.response?.data ?? e.message}');
      rethrow;
    }
  }
}
