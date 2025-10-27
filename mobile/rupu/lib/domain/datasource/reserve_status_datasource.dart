import 'package:rupu/domain/entities/reserve_status.dart';

abstract class ReserveStatusDatasource {
  Future<List<ReserveStatus>> obtenerEstados();
}
