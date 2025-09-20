import '../entities/client.dart';

abstract class ClientDatasource {
  Future<List<Client>> obtenerClientesConReservaHoy({required int businessId});
}
