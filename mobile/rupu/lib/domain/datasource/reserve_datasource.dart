import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveDatasource {
  Future<List<Reserve>> obtenerReservas({required int businessId});
  Future<Reserve> obtenerReserva({required int id});
  Future<Reserve> cancelarReserva({required int id, String? reason});
  Future<Reserve> actualizarReserva({
    required int id,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    required int statusId,
    int? tableId,
  });

  Future<Reserve> crearReserva({
    required int businessId,
    required String name,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    String? dni,
    String? email,
    String? phone,
  });
}
