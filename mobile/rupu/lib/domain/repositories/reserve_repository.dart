import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveRepository {
  Future<List<Reserve>> obtenerReservas();

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
