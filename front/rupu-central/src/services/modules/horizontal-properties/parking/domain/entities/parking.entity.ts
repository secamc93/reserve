/**
 * Entidades: Parking
 * Representa las entidades del módulo de parqueaderos
 */

export interface ParkingZone {
  id: number;
  businessId: number;
  name: string;
  code: string;
  description?: string;
  location?: string;
  totalSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSlot {
  id: number;
  parkingZoneId: number;
  parkingTypeId: number;
  slotNumber: string;
  isCovered: boolean;
  width?: number;
  length?: number;
  height?: number;
  hasCharger: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingAssignment {
  id: number;
  businessId: number;
  parkingSlotId: number;
  propertyUnitId?: number;
  residentId?: number;
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingReservation {
  id: number;
  businessId: number;
  parkingSlotId: number;
  propertyUnitId?: number;
  residentId?: number;
  visitorId?: number;
  visitorVehicleId?: number;
  reservationStatusId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  qrCode?: string;
  accessCode?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  requiresApproval: boolean;
  notes?: string;
  residentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs para listas
export interface ParkingZoneListDTO {
  id: number;
  name: string;
  code: string;
  location: string;
  totalSlots: number;
  isActive: boolean;
}

export interface ParkingSlotListDTO {
  id: number;
  parkingZoneId: number;
  parkingZoneName: string;
  parkingTypeId: number;
  parkingTypeName: string;
  slotNumber: string;
  isCovered: boolean;
  hasCharger: boolean;
  isActive: boolean;
  isAvailable: boolean;
  isAssigned: boolean;
  isOccupied: boolean;
}

export interface ParkingAssignmentListDTO {
  id: number;
  parkingSlotId: number;
  parkingSlotNumber: string;
  propertyUnitId?: number;
  propertyUnitNumber: string;
  residentId?: number;
  residentName: string;
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface ParkingReservationListDTO {
  id: number;
  parkingSlotId: number;
  parkingSlotNumber: string;
  propertyUnitId?: number;
  propertyUnitNumber: string;
  residentId?: number;
  residentName: string;
  visitorId?: number;
  visitorName: string;
  statusName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  vehiclePlate: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
}

// DTOs para crear
export interface CreateParkingZoneDTO {
  name: string;
  code: string;
  description?: string;
  location?: string;
}

export interface CreateParkingSlotDTO {
  parkingZoneId: number;
  parkingTypeId: number;
  slotNumber: string;
  isCovered?: boolean;
  width?: number;
  length?: number;
  height?: number;
  hasCharger?: boolean;
}

export interface AssignParkingDTO {
  parkingSlotId: number;
  propertyUnitId?: number;
  residentId?: number;
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface CreateParkingReservationDTO {
  parkingSlotId: number;
  propertyUnitId?: number;
  residentId?: number;
  visitorId?: number;
  visitorVehicleId?: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  requiresApproval?: boolean;
  notes?: string;
  residentNotes?: string;
}

export interface CheckParkingAvailabilityDTO {
  parkingSlotId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

// Paginación
export interface ParkingZonesPaginated {
  data: ParkingZoneListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ParkingSlotsPaginated {
  data: ParkingSlotListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ParkingAssignmentsPaginated {
  data: ParkingAssignmentListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ParkingReservationsPaginated {
  data: ParkingReservationListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
