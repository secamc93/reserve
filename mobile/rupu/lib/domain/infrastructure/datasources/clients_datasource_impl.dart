import '../../datasource/client_datasource.dart';
import '../../entities/client.dart';
import 'reservas_datasource_impl.dart';

class ClientsDatasourceImpl extends ClientDatasource {
  final ReservasDatasourceImpl reservasDatasource;
  ClientsDatasourceImpl({ReservasDatasourceImpl? datasource})
      : reservasDatasource = datasource ?? ReservasDatasourceImpl();

  @override
  Future<List<Client>> obtenerClientesConReservaHoy({required int businessId}) async {
    final reservas =
        await reservasDatasource.obtenerReservas(businessId: businessId);
    final now = DateTime.now();
    final Map<int, Client> unicos = {};
    for (final r in reservas) {
      final dt = _parseDate(r.startAt);
      if (dt != null && _sameDay(dt, now)) {
        unicos[r.clienteId] = Client(
          id: r.clienteId,
          nombre: r.clienteNombre,
          email: r.clienteEmail,
          telefono: r.clienteTelefono,
          dni: r.clienteDni,
        );
      }
    }
    return unicos.values.toList();
  }

  DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    if (raw is DateTime) return raw.toLocal();
    if (raw is String) return DateTime.tryParse(raw)?.toLocal();
    return null;
  }

  bool _sameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}
