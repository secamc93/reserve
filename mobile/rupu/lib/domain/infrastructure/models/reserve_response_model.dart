/// Modelo de datos para la respuesta de reservas.
class ReservasResponseModel {
  final bool success;
  final List<ReservaModel> data;
  final FiltersModel filters;
  final String message;
  final int total;

  ReservasResponseModel({
    required this.success,
    required this.data,
    required this.filters,
    required this.message,
    required this.total,
  });

  factory ReservasResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final reservas = <ReservaModel>[];
    if (dataJson is List) {
      reservas.addAll(
        dataJson.whereType<Map<String, dynamic>>().map(ReservaModel.fromJson),
      );
    }

    return ReservasResponseModel(
      success: json['success'] as bool? ?? false,
      data: reservas,
      filters: FiltersModel.fromJson(
        (json['filters'] as Map<String, dynamic>? ?? const {}),
      ),
      message: (json['message'] ?? '') as String,
      total: _toInt(json['total']) ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data.map((e) => e.toJson()).toList(),
      'filters': filters.toJson(),
      'message': message,
      'total': total,
    };
  }
}

class ReservaModel {
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

  final List<StatusHistoryItemModel> statusHistory;

  ReservaModel({
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

  factory ReservaModel.fromJson(Map<String, dynamic> json) {
    final historyJson = json['status_history'];
    final history = <StatusHistoryItemModel>[];
    if (historyJson is List) {
      history.addAll(
        historyJson.whereType<Map<String, dynamic>>().map(
          StatusHistoryItemModel.fromJson,
        ),
      );
    }

    return ReservaModel(
      reservaId: _toInt(json['reserva_id']) ?? 0,
      startAt:
          _parseDate(json['start_at']) ??
          DateTime.fromMillisecondsSinceEpoch(0),
      endAt:
          _parseDate(json['end_at']) ?? DateTime.fromMillisecondsSinceEpoch(0),
      numberOfGuests: _toInt(json['number_of_guests']) ?? 0,
      reservaCreada:
          _parseDate(json['reserva_creada']) ??
          DateTime.fromMillisecondsSinceEpoch(0),
      reservaActualizada:
          _parseDate(json['reserva_actualizada']) ??
          DateTime.fromMillisecondsSinceEpoch(0),
      estadoCodigo: (json['estado_codigo'] ?? '') as String,
      estadoNombre: (json['estado_nombre'] ?? '') as String,
      clienteId: _toInt(json['cliente_id']) ?? 0,
      clienteNombre: (json['cliente_nombre'] ?? '') as String,
      clienteEmail: (json['cliente_email'] ?? '') as String,
      clienteTelefono: (json['cliente_telefono'] ?? '') as String,
      clienteDni: (json['cliente_dni'] ?? '') as String,
      mesaId: _toInt(json['mesa_id']),
      mesaNumero: _toInt(json['mesa_numero']),
      mesaCapacidad: _toInt(json['mesa_capacidad']),
      negocioId: _toInt(json['negocio_id']) ?? 0,
      negocioNombre: (json['negocio_nombre'] ?? '') as String,
      negocioCodigo: (json['negocio_codigo'] ?? '') as String,
      negocioDireccion: (json['negocio_direccion'] ?? '') as String,
      usuarioId: _toInt(json['usuario_id']),
      usuarioNombre: _toStringOrNull(json['usuario_nombre']),
      usuarioEmail: _toStringOrNull(json['usuario_email']),
      statusHistory: history,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reserva_id': reservaId,
      'start_at': startAt.toIso8601String(),
      'end_at': endAt.toIso8601String(),
      'number_of_guests': numberOfGuests,
      'reserva_creada': reservaCreada.toIso8601String(),
      'reserva_actualizada': reservaActualizada.toIso8601String(),
      'estado_codigo': estadoCodigo,
      'estado_nombre': estadoNombre,
      'cliente_id': clienteId,
      'cliente_nombre': clienteNombre,
      'cliente_email': clienteEmail,
      'cliente_telefono': clienteTelefono,
      'cliente_dni': clienteDni,
      'mesa_id': mesaId,
      'mesa_numero': mesaNumero,
      'mesa_capacidad': mesaCapacidad,
      'negocio_id': negocioId,
      'negocio_nombre': negocioNombre,
      'negocio_codigo': negocioCodigo,
      'negocio_direccion': negocioDireccion,
      'usuario_id': usuarioId,
      'usuario_nombre': usuarioNombre,
      'usuario_email': usuarioEmail,
      'status_history': statusHistory.map((e) => e.toJson()).toList(),
    };
  }
}

class StatusHistoryItemModel {
  final int id;
  final int statusId;
  final String statusCode;
  final String statusName;
  final DateTime changedAt;
  final int? changedByUserId;
  final String? changedByUser;

  StatusHistoryItemModel({
    required this.id,
    required this.statusId,
    required this.statusCode,
    required this.statusName,
    required this.changedAt,
    this.changedByUserId,
    this.changedByUser,
  });

  factory StatusHistoryItemModel.fromJson(Map<String, dynamic> json) {
    return StatusHistoryItemModel(
      id: _toInt(json['id']) ?? 0,
      statusId: _toInt(json['status_id']) ?? 0,
      statusCode: (json['status_code'] ?? '') as String,
      statusName: (json['status_name'] ?? '') as String,
      changedAt:
          _parseDate(json['changed_at']) ??
          DateTime.fromMillisecondsSinceEpoch(0),
      changedByUserId: _toInt(json['changed_by_user_id']),
      changedByUser: _toStringOrNull(json['changed_by_user']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status_id': statusId,
      'status_code': statusCode,
      'status_name': statusName,
      'changed_at': changedAt.toIso8601String(),
      'changed_by_user_id': changedByUserId,
      'changed_by_user': changedByUser,
    };
  }
}

class FiltersModel {
  final int? clientId;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? statusId;
  final int? tableId;

  FiltersModel({
    this.clientId,
    this.startDate,
    this.endDate,
    this.statusId,
    this.tableId,
  });

  factory FiltersModel.fromJson(Map<String, dynamic> json) {
    return FiltersModel(
      clientId: _toInt(json['client_id']),
      startDate: _parseDate(json['start_date']),
      endDate: _parseDate(json['end_date']),
      statusId: _toInt(json['status_id']),
      tableId: _toInt(json['table_id']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'client_id': clientId,
      'start_date': startDate?.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'status_id': statusId,
      'table_id': tableId,
    };
  }
}

/// Helpers

int? _toInt(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v);
  return null;
}

DateTime? _parseDate(dynamic v) {
  if (v == null) return null;
  if (v is String && v.isEmpty) return null;
  try {
    return DateTime.parse(v as String);
  } catch (_) {
    return null;
  }
}

String? _toStringOrNull(dynamic v) {
  if (v == null) return null;
  if (v is String) return v;
  return v.toString();
}
