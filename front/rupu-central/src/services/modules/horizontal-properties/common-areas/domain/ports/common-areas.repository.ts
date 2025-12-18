/**
 * Puerto: ICommonAreasRepository
 * Define el contrato para el repositorio de zonas comunes y reservas
 */

import {
  CommonArea,
  CommonAreaListDTO,
  CreateCommonAreaDTO,
  CommonAreasPaginated,
  CommonAreaReservation,
  ReservationListDTO,
  CreateReservationDTO,
  CheckAvailabilityDTO,
  ReservationsPaginated,
} from '../entities';

export interface GetCommonAreasParams {
  businessId: number;
  commonAreaTypeId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetCommonAreaByIdParams {
  id: number;
}

export interface CreateCommonAreaParams {
  businessId: number;
  data: CreateCommonAreaDTO;
}

export interface CreateReservationParams {
  businessId: number;
  data: CreateReservationDTO;
}

export interface CheckAvailabilityParams {
  data: CheckAvailabilityDTO;
}

export interface GetReservationsParams {
  businessId: number;
  commonAreaId?: number;
  propertyUnitId?: number;
  residentId?: number;
  reservationStatusId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface GetReservationByIdParams {
  id: number;
}

export interface ApproveReservationParams {
  id: number;
}

export interface RejectReservationParams {
  id: number;
  reason: string;
}

export interface CheckInReservationParams {
  id: number;
}

export interface CheckOutReservationParams {
  id: number;
}

export interface CancelReservationParams {
  id: number;
  reason?: string;
}

export interface ICommonAreasRepository {
  getCommonAreas(params: GetCommonAreasParams): Promise<CommonAreasPaginated>;
  getCommonAreaById(params: GetCommonAreaByIdParams): Promise<CommonArea>;
  createCommonArea(params: CreateCommonAreaParams): Promise<CommonArea>;
  createReservation(params: CreateReservationParams): Promise<CommonAreaReservation>;
  checkAvailability(params: CheckAvailabilityParams): Promise<{ available: boolean; message?: string }>;
  getReservations(params: GetReservationsParams): Promise<ReservationsPaginated>;
  getReservationById(params: GetReservationByIdParams): Promise<CommonAreaReservation>;
  approveReservation(params: ApproveReservationParams): Promise<CommonAreaReservation>;
  rejectReservation(params: RejectReservationParams): Promise<CommonAreaReservation>;
  checkInReservation(params: CheckInReservationParams): Promise<CommonAreaReservation>;
  checkOutReservation(params: CheckOutReservationParams): Promise<CommonAreaReservation>;
  cancelReservation(params: CancelReservationParams): Promise<CommonAreaReservation>;
}
