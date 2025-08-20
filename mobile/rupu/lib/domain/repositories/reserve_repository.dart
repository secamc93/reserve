import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveRepository {
  Future<List<Reserve>> obtenerReservas();

  Future<Reserve> obtenerReserva({required int id});
  Future<Reserve> actualizarReserva({
    required int id,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    required int statusId,
    int? tableId,
  });

  Future<Reserve> cancelarReserva({required int id, String? reason});

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
