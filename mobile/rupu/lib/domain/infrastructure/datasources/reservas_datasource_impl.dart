import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/config/helpers/human_formats.dart';
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

  @override
  Future<Reserve> crearReserva({
    required int businessId,
    required String name,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    String? dni,
    String? email,
    String? phone,
  }) async {
    try {
      final Map<String, dynamic> payload = {
        'business_id': businessId, // ya tienes 1
        'name': name,
        'number_of_guests': numberOfGuests,
        'start_at': toRfc3339(startAt), // 2024-12-31T23:59:59Z
        'end_at': toRfc3339(endAt),
      };

      // Solo agrega si tienen texto
      if ((dni ?? '').trim().isNotEmpty) payload['dni'] = dni!.trim();
      if ((email ?? '').trim().isNotEmpty) payload['email'] = email!.trim();
      if ((phone ?? '').trim().isNotEmpty) payload['phone'] = phone!.trim();

      debugPrint('POST /reserves payload => $payload'); // 👈 para

      final resp = await _dio.post('/reserves', data: payload);

      // Ajusta a tu respuesta real. Soportamos { data: {...} } y objeto directo.
      final data = resp.data;
      Map<String, dynamic>? json;
      if (data is Map<String, dynamic> &&
          data['data'] is Map<String, dynamic>) {
        json = data['data'] as Map<String, dynamic>;
      } else if (data is Map<String, dynamic>) {
        json = data;
      }
      if (json == null) {
        throw Exception('Formato de respuesta inesperado en POST /reserves');
      }

      final model = ReservaModel.fromJson(json);
      return ReservesMapper.reservaFromModel(model);
    } on DioException catch (e) {
      debugPrint(
        'Error crear reserva [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }

  @override
  Future<Reserve> obtenerReserva({required int id}) async {
    try {
      final response = await _dio.get('/reserves/$id');

      final data = response.data;
      Map<String, dynamic>? json;
      if (data is Map<String, dynamic> &&
          data['data'] is Map<String, dynamic>) {
        json = data['data'] as Map<String, dynamic>;
      } else if (data is Map<String, dynamic>) {
        json = data;
      }
      if (json == null) {
        throw Exception('Formato de respuesta inesperado en GET /reserves/$id');
      }

      final model = ReservaModel.fromJson(json);
      return ReservesMapper.reservaFromModel(model);
    } on DioException catch (e) {
      debugPrint(
        'Error obtener reserva [$id] [${e.response?.statusCode}]: ${e.response?.data ?? e.message}',
      );
      rethrow;
    }
  }
  
  @override
  Future<Reserve> actualizarReserva({required int id}) {
    // TODO: implement actualizarReserva
    throw UnimplementedError();
  }
}
