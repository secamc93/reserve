class ReservesResponse {
  final List<Reserve> data;
  final Filters filters;
  final String message;
  final bool success;
  final int total;

  ReservesResponse({
    required this.data,
    required this.filters,
    required this.message,
    required this.success,
    required this.total,
  });
}

class Reserve {
  final int reservaId;
  final DateTime startAt;
  final DateTime endAt;
  final int numberOfGuests;
  final DateTime reservaCreada;
  final DateTime reservaActualizada;

  final String estadoCodigo;
  final String estadoNombre;

  final int clienteId;
  final String clienteNombre;
  final String clienteEmail;
  final String clienteTelefono;
  final String clienteDni;

  final int? mesaId;
  final int? mesaNumero;
  final int? mesaCapacidad;

  final int negocioId;
  final String negocioNombre;
  final String negocioCodigo;
  final String negocioDireccion;

  final int? usuarioId;
  final String? usuarioNombre;
  final String? usuarioEmail;

  final List<StatusHistoryItem> statusHistory;

  Reserve({
    required this.reservaId,
    required this.startAt,
    required this.endAt,
    required this.numberOfGuests,
    required this.reservaCreada,
    required this.reservaActualizada,
    required this.estadoCodigo,
    required this.estadoNombre,
    required this.clienteId,
    required this.clienteNombre,
    required this.clienteEmail,
    required this.clienteTelefono,
    required this.clienteDni,
    this.mesaId,
    this.mesaNumero,
    this.mesaCapacidad,
    required this.negocioId,
    required this.negocioNombre,
    required this.negocioCodigo,
    required this.negocioDireccion,
    this.usuarioId,
    this.usuarioNombre,
    this.usuarioEmail,
    required this.statusHistory,
  });
}

class StatusHistoryItem {
  final int id;
  final int statusId;
  final String statusCode;
  final String statusName;
  final DateTime changedAt;
  final int? changedByUserId;
  final String? changedByUser;

  StatusHistoryItem({
    required this.id,
    required this.statusId,
    required this.statusCode,
    required this.statusName,
    required this.changedAt,
    this.changedByUserId,
    this.changedByUser,
  });
}

class Filters {
  final int? clientId;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? statusId;
  final int? tableId;

  Filters({
    this.clientId,
    this.startDate,
    this.endDate,
    this.statusId,
    this.tableId,
  });
}
