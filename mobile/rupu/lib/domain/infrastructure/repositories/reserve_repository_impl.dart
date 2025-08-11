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
}
