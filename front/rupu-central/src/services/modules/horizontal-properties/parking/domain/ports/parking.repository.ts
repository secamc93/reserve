/**
 * Puerto: IParkingRepository
 * Define el contrato para el repositorio de parqueaderos
 */

import {
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
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingSlotsParams {
  businessId: number;
  parkingZoneId?: number;
  parkingTypeId?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingAssignmentsParams {
  businessId: number;
  parkingSlotId?: number;
  propertyUnitId?: number;
  residentId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetParkingReservationsParams {
  businessId: number;
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
  // Zonas de parqueo
  getParkingZones(params: GetParkingZonesParams): Promise<ParkingZonesPaginated>;
  createParkingZone(params: { businessId: number; data: CreateParkingZoneDTO }): Promise<ParkingZone>;

  // Espacios de parqueo
  getParkingSlots(params: GetParkingSlotsParams): Promise<ParkingSlotsPaginated>;
  createParkingSlot(params: { data: CreateParkingSlotDTO }): Promise<ParkingSlot>;

  // Asignaciones
  getParkingAssignments(params: GetParkingAssignmentsParams): Promise<ParkingAssignmentsPaginated>;
  assignParking(params: { businessId: number; data: AssignParkingDTO }): Promise<ParkingAssignment>;

  // Reservas
  getParkingReservations(params: GetParkingReservationsParams): Promise<ParkingReservationsPaginated>;
  createParkingReservation(params: { businessId: number; data: CreateParkingReservationDTO }): Promise<ParkingReservation>;
  checkParkingAvailability(params: { data: CheckParkingAvailabilityDTO }): Promise<{ available: boolean; message?: string }>;
  checkInParking(params: { id: number }): Promise<ParkingReservation>;
  checkOutParking(params: { id: number }): Promise<ParkingReservation>;
  cancelParkingReservation(params: { id: number; reason?: string }): Promise<ParkingReservation>;
}
