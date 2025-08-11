import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/reserve_datasource.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/infrastructure/mappers/reserve_mapper.dart';
import 'package:rupu/domain/infrastructure/models/reserve_response_model.dart';

class ReservasDatasourceImpl extends ReserveDatasource {
  final Dio _dio;

  ReservasDatasourceImpl({String? baseUrl})
    : _dio = AuthenticatedDio(
        baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
      ).dio;

  @override
  Future<List<Reserve>> obtenerReservas() async {
    try {
      final response = await _dio.get('/reserves');

      final model = ReservasResponseModel.fromJson(
        response.data as Map<String, dynamic>,
      );

      return model.data.map(ReservesMapper.reservaFromModel).toList();
    } on DioException catch (e) {
      debugPrint(
        'Error obtener roles y permisos [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }
}
