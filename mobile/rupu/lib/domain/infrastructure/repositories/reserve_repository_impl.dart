import 'package:rupu/domain/datasource/reserve_datasource.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';

class ReserveRepositoryImpl extends ReserveRepository {
  final ReserveDatasource datasource;
  ReserveRepositoryImpl(this.datasource);

  @override
  Future<List<Reserve>> obtenerReservas() {
    return datasource.obtenerReservas();
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
}
