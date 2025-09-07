import '../../datasource/client_datasource.dart';
import '../../entities/client.dart';
import '../../repositories/client_repository.dart';

class ClientRepositoryImpl extends ClientRepository {
  final ClientDatasource datasource;
  ClientRepositoryImpl(this.datasource);

  @override
  Future<List<Client>> obtenerClientesConReservaHoy() {
    return datasource.obtenerClientesConReservaHoy();
  }
}
