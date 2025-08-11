import 'package:rupu/domain/entities/reserve.dart';

abstract class ReserveDatasource {
  Future<List<Reserve>> obtenerReservas();
}
