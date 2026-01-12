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
  CommonAreaType,
} from '../entities';

export interface GetCommonAreasParams {
  businessId: number;
  token: string;
  commonAreaTypeId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetCommonAreaByIdParams {
  id: number;
  token: string;
}

export interface CreateCommonAreaParams {
  businessId: number;
  token: string;
  data: CreateCommonAreaDTO;
}

export interface CreateReservationParams {
  businessId: number;
  token: string;
  data: CreateReservationDTO;
}

export interface CheckAvailabilityParams {
  token: string;
  data: CheckAvailabilityDTO;
}

export interface GetReservationsParams {
  businessId: number;
  token: string;
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
  token: string;
}

export interface ApproveReservationParams {
  id: number;
  token: string;
}

export interface RejectReservationParams {
  id: number;
  token: string;
  reason: string;
}

export interface CheckInReservationParams {
  id: number;
  token: string;
}

export interface CheckOutReservationParams {
  id: number;
  token: string;
}

export interface CancelReservationParams {
  id: number;
  token: string;
  reason?: string;
}

export interface ICommonAreasRepository {
  getCommonAreaTypes(token: string): Promise<CommonAreaType[]>;
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
