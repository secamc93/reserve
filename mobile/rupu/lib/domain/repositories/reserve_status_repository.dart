import 'package:rupu/domain/entities/reserve_status.dart';

abstract class ReserveStatusRepository {
  Future<List<ReserveStatus>> obtenerEstados();
}
