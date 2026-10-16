/**
 * Casos de uso de administración: editar/eliminar zonas, horario semanal, bloqueos,
 * buscador de unidades, confirmar reservas y registrar pagos.
 */

import type {
  ICommonAreasRepository,
  UpdateCommonAreaParams,
  DeleteCommonAreaParams,
  GetCommonAreaByIdParams,
  SetSchedulesParams,
  CreateRestrictionParams,
  DeleteRestrictionParams,
  SearchUnitsParams,
  ReservationIdParams,
  UpdatePaymentsParams,
} from '../domain';

export class UpdateCommonAreaUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: UpdateCommonAreaParams) {
    return this.repository.updateCommonArea(params);
  }
}

export class DeleteCommonAreaUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: DeleteCommonAreaParams) {
    return this.repository.deleteCommonArea(params);
  }
}

export class GetSchedulesUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: GetCommonAreaByIdParams) {
    return this.repository.getSchedules(params);
  }
}

export class SetSchedulesUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: SetSchedulesParams) {
    return this.repository.setSchedules(params);
  }
}

export class GetRestrictionsUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: GetCommonAreaByIdParams) {
    return this.repository.getRestrictions(params);
  }
}

export class CreateRestrictionUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: CreateRestrictionParams) {
    return this.repository.createRestriction(params);
  }
}

export class DeleteRestrictionUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: DeleteRestrictionParams) {
    return this.repository.deleteRestriction(params);
  }
}

export class SearchUnitsUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: SearchUnitsParams) {
    return this.repository.searchUnits(params);
  }
}

export class ConfirmReservationUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: ReservationIdParams) {
    return this.repository.confirmReservation(params);
  }
}

export class UpdateReservationPaymentsUseCase {
  constructor(private repository: ICommonAreasRepository) {}
  execute(params: UpdatePaymentsParams) {
    return this.repository.updatePayments(params);
  }
}
