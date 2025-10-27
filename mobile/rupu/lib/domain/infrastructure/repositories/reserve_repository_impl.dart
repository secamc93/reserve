import 'package:rupu/domain/datasource/reserve_datasource.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';

class ReserveRepositoryImpl extends ReserveRepository {
  final ReserveDatasource datasource;
  ReserveRepositoryImpl(this.datasource);

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
  }) {
    return datasource.crearReserva(
      businessId: businessId,
      name: name,
      startAt: startAt,
      endAt: endAt,
      numberOfGuests: numberOfGuests,
      dni: dni,
      email: email,
      phone: phone,
    );
  }

  @override
  Future<List<Reserve>> obtenerReservas({required int businessId}) {
    return datasource.obtenerReservas(businessId: businessId);
  }

  @override
  Future<Reserve> obtenerReserva({required int id}) {
    return datasource.obtenerReserva(id: id);
  }

  @override
  Future<Reserve> cancelarReserva({required int id, String? reason}) {
    return datasource.cancelarReserva(id: id, reason: reason);
  }

  @override
  Future<Reserve> actualizarReserva({
    required int id,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    required int statusId,
    int? tableId,
  }) {
    return datasource.actualizarReserva(
      id: id,
      startAt: startAt,
      endAt: endAt,
      numberOfGuests: numberOfGuests,
      statusId: statusId,
      tableId: tableId,
    );
  }
}
