import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveDatasource {
  Future<List<Reserve>> obtenerReservas();
  Future<Reserve> obtenerReserva({required int id});
  Future<Reserve> actualizarReserva({
    required int id,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
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
