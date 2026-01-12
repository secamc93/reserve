/**
 * Puerto: IParkingRepository
 * Define el contrato para el repositorio de parqueaderos
 */

import {
  ParkingType,
  ParkingZone,
  ParkingSlot,
  ParkingAssignment,
  ParkingReservation,
  ParkingZoneListDTO,
  ParkingSlotListDTO,
  ParkingAssignmentListDTO,
  ParkingReservationListDTO,
  CreateParkingZoneDTO,
  CreateParkingSlotDTO,
  AssignParkingDTO,
  CreateParkingReservationDTO,
  CheckParkingAvailabilityDTO,
  ParkingZonesPaginated,
  ParkingSlotsPaginated,
  ParkingAssignmentsPaginated,
  ParkingReservationsPaginated,
} from '../entities';

export interface GetParkingZonesParams {
  businessId: number;
  token: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingSlotsParams {
  businessId: number;
  token: string;
  parkingZoneId?: number;
  parkingTypeId?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingAssignmentsParams {
  businessId: number;
  token: string;
  parkingSlotId?: number;
  propertyUnitId?: number;
  residentId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingReservationsParams {
  businessId: number;
  token: string;
  parkingSlotId?: number;
  propertyUnitId?: number;
  residentId?: number;
  visitorId?: number;
  reservationStatusId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface IParkingRepository {
  // Tipos de parqueadero
  getParkingTypes(token: string): Promise<ParkingType[]>;

  // Zonas de parqueo
  getParkingZones(params: GetParkingZonesParams): Promise<ParkingZonesPaginated>;
  createParkingZone(params: { businessId: number; token: string; data: CreateParkingZoneDTO }): Promise<ParkingZone>;

  // Espacios de parqueo
  getParkingSlots(params: GetParkingSlotsParams): Promise<ParkingSlotsPaginated>;
  createParkingSlot(params: { token: string; data: CreateParkingSlotDTO }): Promise<ParkingSlot>;

  // Asignaciones
  getParkingAssignments(params: GetParkingAssignmentsParams): Promise<ParkingAssignmentsPaginated>;
  assignParking(params: { businessId: number; token: string; data: AssignParkingDTO }): Promise<ParkingAssignment>;

  // Reservas
  getParkingReservations(params: GetParkingReservationsParams): Promise<ParkingReservationsPaginated>;
  createParkingReservation(params: { businessId: number; token: string; data: CreateParkingReservationDTO }): Promise<ParkingReservation>;
  checkParkingAvailability(params: { token: string; data: CheckParkingAvailabilityDTO }): Promise<{ available: boolean; message?: string }>;
  checkInParking(params: { id: number; token: string }): Promise<ParkingReservation>;
  checkOutParking(params: { id: number; token: string }): Promise<ParkingReservation>;
  cancelParkingReservation(params: { id: number; token: string; reason?: string }): Promise<ParkingReservation>;
}
