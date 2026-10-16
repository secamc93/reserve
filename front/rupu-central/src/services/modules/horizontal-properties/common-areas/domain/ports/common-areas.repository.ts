/**
 * Puerto: ICommonAreasRepository
 * Contrato del repositorio de zonas comunes y reservas. Todas las operaciones llevan el
 * businessId de la propiedad: el back lo usa para el super admin (?business_id=) y valida
 * que zonas y reservas pertenezcan a esa propiedad.
 */

import {
  CommonArea,
  CreateCommonAreaDTO,
  UpdateCommonAreaDTO,
  CommonAreasPaginated,
  CommonAreaReservation,
  CreateReservationDTO,
  CheckAvailabilityDTO,
  ReservationsPaginated,
  CommonAreaType,
  CommonAreaSchedule,
  CommonAreaRestriction,
  CreateRestrictionDTO,
  UnitLookup,
  UpdatePaymentsDTO,
} from '../entities';

interface Scoped {
  businessId: number;
  token: string;
}

export interface GetCommonAreasParams extends Scoped {
  commonAreaTypeId?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetCommonAreaByIdParams extends Scoped {
  id: number;
}

export interface CreateCommonAreaParams extends Scoped {
  data: CreateCommonAreaDTO;
}

export interface UpdateCommonAreaParams extends Scoped {
  id: number;
  data: UpdateCommonAreaDTO;
}

export interface DeleteCommonAreaParams extends Scoped {
  id: number;
}

export interface SetSchedulesParams extends Scoped {
  id: number;
  schedules: CommonAreaSchedule[];
}

export interface CreateRestrictionParams extends Scoped {
  id: number;
  data: CreateRestrictionDTO;
}

export interface DeleteRestrictionParams extends Scoped {
  id: number;
  restrictionId: number;
}

export interface SearchUnitsParams extends Scoped {
  search?: string;
  limit?: number;
}

export interface CreateReservationParams extends Scoped {
  data: CreateReservationDTO;
}

export interface CheckAvailabilityParams extends Scoped {
  data: CheckAvailabilityDTO;
}

export interface GetReservationsParams extends Scoped {
  commonAreaId?: number;
  propertyUnitId?: number;
  residentId?: number;
  reservationStatusId?: number;
  /** Códigos de estado: ["pending"], ["approved","confirmed"]… */
  status?: string[];
  /** "YYYY-MM-DD" (inclusive) */
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface ReservationIdParams extends Scoped {
  id: number;
}

/** Alias conservados por compatibilidad. */
export type GetReservationByIdParams = ReservationIdParams;
export type ApproveReservationParams = ReservationIdParams;
export type CheckInReservationParams = ReservationIdParams;
export type CheckOutReservationParams = ReservationIdParams;
export type ConfirmReservationParams = ReservationIdParams;

export interface RejectReservationParams extends ReservationIdParams {
  reason: string;
}

export interface CancelReservationParams extends ReservationIdParams {
  reason?: string;
}

export interface UpdatePaymentsParams extends ReservationIdParams {
  data: UpdatePaymentsDTO;
}

export interface ICommonAreasRepository {
  getCommonAreaTypes(token: string): Promise<CommonAreaType[]>;
  getCommonAreas(params: GetCommonAreasParams): Promise<CommonAreasPaginated>;
  getCommonAreaById(params: GetCommonAreaByIdParams): Promise<CommonArea>;
  createCommonArea(params: CreateCommonAreaParams): Promise<CommonArea>;
  updateCommonArea(params: UpdateCommonAreaParams): Promise<CommonArea>;
  deleteCommonArea(params: DeleteCommonAreaParams): Promise<void>;
  getSchedules(params: GetCommonAreaByIdParams): Promise<CommonAreaSchedule[]>;
  setSchedules(params: SetSchedulesParams): Promise<CommonAreaSchedule[]>;
  getRestrictions(params: GetCommonAreaByIdParams): Promise<CommonAreaRestriction[]>;
  createRestriction(params: CreateRestrictionParams): Promise<CommonAreaRestriction>;
  deleteRestriction(params: DeleteRestrictionParams): Promise<void>;
  searchUnits(params: SearchUnitsParams): Promise<UnitLookup[]>;
  createReservation(params: CreateReservationParams): Promise<CommonAreaReservation>;
  checkAvailability(params: CheckAvailabilityParams): Promise<{ available: boolean; message?: string }>;
  getReservations(params: GetReservationsParams): Promise<ReservationsPaginated>;
  getReservationById(params: ReservationIdParams): Promise<CommonAreaReservation>;
  approveReservation(params: ReservationIdParams): Promise<CommonAreaReservation>;
  rejectReservation(params: RejectReservationParams): Promise<CommonAreaReservation>;
  confirmReservation(params: ReservationIdParams): Promise<CommonAreaReservation>;
  checkInReservation(params: ReservationIdParams): Promise<CommonAreaReservation>;
  checkOutReservation(params: ReservationIdParams): Promise<CommonAreaReservation>;
  cancelReservation(params: CancelReservationParams): Promise<CommonAreaReservation>;
  updatePayments(params: UpdatePaymentsParams): Promise<CommonAreaReservation>;
}
