import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/infrastructure/models/reserve_response_model.dart';

class ReservesMapper {
  static ReservesResponse responseToEntity(ReservasResponseModel model) =>
      ReservesResponse(
        // <-- Asegúrate que sea *ReservasResponse*, no *ReservesResponse*
        success: model.success,
        data: model.data.map(reservaFromModel).toList(),
        filters: _filtersFromModel(model.filters),
        message: model.message,
        total: model.total,
      );

  static Reserve reservaFromModel(ReservaModel m) => Reserve(
    reservaId: m.reservaId,
    startAt: m.startAt,
    endAt: m.endAt,
    numberOfGuests: m.numberOfGuests,
    reservaCreada: m.reservaCreada,
    reservaActualizada: m.reservaActualizada,
    estadoCodigo: m.estadoCodigo,
    estadoNombre: m.estadoNombre,
    clienteId: m.clienteId,
    clienteNombre: m.clienteNombre,
    clienteEmail: m.clienteEmail,
    clienteTelefono: m.clienteTelefono,
    clienteDni: m.clienteDni,
    mesaId: m.mesaId,
    mesaNumero: m.mesaNumero,
    mesaCapacidad: m.mesaCapacidad,
    negocioId: m.negocioId,
    negocioNombre: m.negocioNombre,
    negocioCodigo: m.negocioCodigo,
    negocioDireccion: m.negocioDireccion,
    usuarioId: m.usuarioId,
    usuarioNombre: m.usuarioNombre,
    usuarioEmail: m.usuarioEmail,
    statusHistory: m.statusHistory.map(_statusHistoryFromModel).toList(),
  );

  static StatusHistoryItem _statusHistoryFromModel(StatusHistoryItemModel m) =>
      StatusHistoryItem(
        id: m.id,
        statusId: m.statusId,
        statusCode: m.statusCode,
        statusName: m.statusName,
        changedAt: m.changedAt,
        changedByUserId: m.changedByUserId,
        changedByUser: m.changedByUser,
      );

  static Filters _filtersFromModel(FiltersModel m) => Filters(
    clientId: m.clientId,
    startDate: m.startDate,
    endDate: m.endDate,
    statusId: m.statusId,
    tableId: m.tableId,
  );
}
