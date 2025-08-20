import 'package:rupu/domain/datasource/reserve_status_datasource.dart';
import 'package:rupu/domain/entities/reserve_status.dart';
import 'package:rupu/domain/repositories/reserve_status_repository.dart';

class ReserveStatusRepositoryImpl extends ReserveStatusRepository {
  final ReserveStatusDatasource datasource;
  ReserveStatusRepositoryImpl(this.datasource);

  @override
  Future<List<ReserveStatus>> obtenerEstados() {
    return datasource.obtenerEstados();
  }
}
