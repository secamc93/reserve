import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveRepository {
  Future<List<Reserve>> obtenerReservas();
}
