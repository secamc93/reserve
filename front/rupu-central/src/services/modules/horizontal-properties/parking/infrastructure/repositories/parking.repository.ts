/**
 * Implementación del repositorio de Parqueaderos
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IParkingRepository,
  GetParkingZonesParams,
  GetParkingSlotsParams,
  GetParkingAssignmentsParams,
  GetParkingReservationsParams,
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
} from '../../domain';
import {
  BackendParkingTypesResponse,
  BackendParkingType,
  BackendParkingZoneResponse,
  BackendParkingZonesPaginatedResponse,
  BackendParkingZone,
  BackendParkingZoneList,
  BackendParkingSlotResponse,
  BackendParkingSlotsPaginatedResponse,
  BackendParkingSlot,
  BackendParkingSlotList,
  BackendParkingAssignmentResponse,
  BackendParkingAssignmentsPaginatedResponse,
  BackendParkingAssignment,
  BackendParkingAssignmentList,
  BackendParkingReservationResponse,
  BackendParkingReservationsPaginatedResponse,
  BackendParkingReservation,
  BackendParkingReservationList,
  BackendCheckParkingAvailabilityResponse,
} from './response/parking.response';

export class ParkingRepository implements IParkingRepository {
  private baseUrl = env.API_BASE_URL;

  // Helper function to convert camelCase to snake_case
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  // Convert object keys from camelCase to snake_case
  private convertToSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = this.toSnakeCase(key);
        result[snakeKey] = obj[key];
      }
    }
    return result;
  }

  private mapBackendParkingType(type: BackendParkingType): ParkingType {
    return {
      id: type.id,
      name: type.name,
      code: type.code,
      description: type.description,
      isActive: type.is_active,
      createdAt: type.created_at,
      updatedAt: type.updated_at,
    };
  }

  private mapBackendParkingZone(zone: BackendParkingZone): ParkingZone {
    return {
      id: zone.id,
      businessId: zone.business_id,
      name: zone.name,
      code: zone.code,
      description: zone.description,
      location: zone.location,
      totalSlots: zone.total_slots,
      isActive: zone.is_active,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at,
    };
  }

  private mapBackendParkingZoneList(zone: BackendParkingZoneList): ParkingZoneListDTO {
    return {
      id: zone.id,
      name: zone.name,
      code: zone.code,
      location: zone.location,
      totalSlots: zone.total_slots,
      isActive: zone.is_active,
    };
  }

  private mapBackendParkingSlot(slot: BackendParkingSlot): ParkingSlot {
    return {
      id: slot.id,
      parkingZoneId: slot.parking_zone_id,
      parkingTypeId: slot.parking_type_id,
      slotNumber: slot.slot_number,
      isCovered: slot.is_covered,
      width: slot.width,
      length: slot.length,
      height: slot.height,
      hasCharger: slot.has_charger,
      isActive: slot.is_active,
      createdAt: slot.created_at,
      updatedAt: slot.updated_at,
    };
  }

  private mapBackendParkingSlotList(slot: BackendParkingSlotList): ParkingSlotListDTO {
    return {
      id: slot.id,
      parkingZoneId: slot.parking_zone_id,
      parkingZoneName: slot.parking_zone_name,
      parkingTypeId: slot.parking_type_id,
      parkingTypeName: slot.parking_type_name,
      slotNumber: slot.slot_number,
      isCovered: slot.is_covered,
      hasCharger: slot.has_charger,
      isActive: slot.is_active,
      isAvailable: slot.is_available,
      isAssigned: slot.is_assigned,
      isOccupied: slot.is_occupied,
    };
  }

  private mapBackendParkingAssignment(assignment: BackendParkingAssignment): ParkingAssignment {
    return {
      id: assignment.id,
      businessId: assignment.business_id,
      parkingSlotId: assignment.parking_slot_id,
      propertyUnitId: assignment.property_unit_id,
      residentId: assignment.resident_id,
      vehiclePlate: assignment.vehicle_plate,
      vehicleBrand: assignment.vehicle_brand,
      vehicleModel: assignment.vehicle_model,
      vehicleColor: assignment.vehicle_color,
      startDate: assignment.start_date,
      endDate: assignment.end_date,
      isActive: assignment.is_active,
      notes: assignment.notes,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    };
  }

  private mapBackendParkingAssignmentList(assignment: BackendParkingAssignmentList): ParkingAssignmentListDTO {
    return {
      id: assignment.id,
      parkingSlotId: assignment.parking_slot_id,
      parkingSlotNumber: assignment.parking_slot_number,
      propertyUnitId: assignment.property_unit_id,
      propertyUnitNumber: assignment.property_unit_number,
      residentId: assignment.resident_id,
      residentName: assignment.resident_name,
      vehiclePlate: assignment.vehicle_plate,
      vehicleBrand: assignment.vehicle_brand,
      vehicleModel: assignment.vehicle_model,
      startDate: assignment.start_date,
      endDate: assignment.end_date,
      isActive: assignment.is_active,
    };
  }

  private mapBackendParkingReservation(reservation: BackendParkingReservation): ParkingReservation {
    return {
      id: reservation.id,
      businessId: reservation.business_id,
      parkingSlotId: reservation.parking_slot_id,
      propertyUnitId: reservation.property_unit_id,
      residentId: reservation.resident_id,
      visitorId: reservation.visitor_id,
      visitorVehicleId: reservation.visitor_vehicle_id,
      reservationStatusId: reservation.reservation_status_id,
      reservationDate: reservation.reservation_date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      durationHours: reservation.duration_hours,
      vehiclePlate: reservation.vehicle_plate,
      vehicleBrand: reservation.vehicle_brand,
      vehicleModel: reservation.vehicle_model,
      vehicleColor: reservation.vehicle_color,
      qrCode: reservation.qr_code,
      accessCode: reservation.access_code,
      checkedInAt: reservation.checked_in_at,
      checkedOutAt: reservation.checked_out_at,
      requiresApproval: reservation.requires_approval,
      notes: reservation.notes,
      residentNotes: reservation.resident_notes,
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at,
    };
  }

  private mapBackendParkingReservationList(reservation: BackendParkingReservationList): ParkingReservationListDTO {
    return {
      id: reservation.id,
      parkingSlotId: reservation.parking_slot_id,
      parkingSlotNumber: reservation.parking_slot_number,
      propertyUnitId: reservation.property_unit_id,
      propertyUnitNumber: reservation.property_unit_number,
      residentId: reservation.resident_id,
      residentName: reservation.resident_name,
      visitorId: reservation.visitor_id,
      visitorName: reservation.visitor_name,
      statusName: reservation.status_name,
      reservationDate: reservation.reservation_date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      vehiclePlate: reservation.vehicle_plate,
      checkedInAt: reservation.checked_in_at,
      checkedOutAt: reservation.checked_out_at,
      createdAt: reservation.created_at,
    };
  }

  async getParkingTypes(token: string): Promise<ParkingType[]> {
    const url = `${this.baseUrl}/horizontal-properties/parking/types`;
    const startTime = Date.now();
    logHttpRequest({ method: 'GET', url });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendParkingTypesResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return data.data.map((type) => this.mapBackendParkingType(type));
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async getParkingZones(params: GetParkingZonesParams): Promise<ParkingZonesPaginated> {
    const url = `${this.baseUrl}/horizontal-properties/parking/zones`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    if (params.isActive !== undefined) {
      queryParams.append('is_active', params.isActive.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }

    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    logHttpRequest({ method: 'GET', url: fullUrl });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendParkingZonesPaginatedResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return {
        data: data.data.map((zone) => this.mapBackendParkingZoneList(zone)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async createParkingZone(params: { businessId: number; token: string; data: CreateParkingZoneDTO }): Promise<ParkingZone> {
    const url = `${this.baseUrl}/horizontal-properties/parking/zones`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    const snakeCaseData = this.convertToSnakeCase(params.data as unknown as Record<string, unknown>);
    logHttpRequest({ method: 'POST', url: fullUrl, body: snakeCaseData });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingZoneResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingZone(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async getParkingSlots(params: GetParkingSlotsParams): Promise<ParkingSlotsPaginated> {
    const url = `${this.baseUrl}/horizontal-properties/parking/slots`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    if (params.parkingZoneId) {
      queryParams.append('parking_zone_id', params.parkingZoneId.toString());
    }
    if (params.parkingTypeId) {
      queryParams.append('parking_type_id', params.parkingTypeId.toString());
    }
    if (params.isActive !== undefined) {
      queryParams.append('is_active', params.isActive.toString());
    }
    if (params.isAvailable !== undefined) {
      queryParams.append('is_available', params.isAvailable.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }

    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    logHttpRequest({ method: 'GET', url: fullUrl });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendParkingSlotsPaginatedResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return {
        data: data.data.map((slot) => this.mapBackendParkingSlotList(slot)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async createParkingSlot(params: { token: string; data: CreateParkingSlotDTO }): Promise<ParkingSlot> {
    const url = `${this.baseUrl}/horizontal-properties/parking/slots`;
    const startTime = Date.now();
    const snakeCaseData = this.convertToSnakeCase(params.data as unknown as Record<string, unknown>);
    logHttpRequest({ method: 'POST', url, body: snakeCaseData });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingSlotResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingSlot(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async getParkingAssignments(params: GetParkingAssignmentsParams): Promise<ParkingAssignmentsPaginated> {
    const url = `${this.baseUrl}/horizontal-properties/parking/assignments`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    if (params.parkingSlotId) {
      queryParams.append('parking_slot_id', params.parkingSlotId.toString());
    }
    if (params.propertyUnitId) {
      queryParams.append('property_unit_id', params.propertyUnitId.toString());
    }
    if (params.residentId) {
      queryParams.append('resident_id', params.residentId.toString());
    }
    if (params.isActive !== undefined) {
      queryParams.append('is_active', params.isActive.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }

    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    logHttpRequest({ method: 'GET', url: fullUrl });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendParkingAssignmentsPaginatedResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return {
        data: data.data.map((assignment) => this.mapBackendParkingAssignmentList(assignment)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async assignParking(params: { businessId: number; token: string; data: AssignParkingDTO }): Promise<ParkingAssignment> {
    const url = `${this.baseUrl}/horizontal-properties/parking/assignments`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    const snakeCaseData = this.convertToSnakeCase(params.data as unknown as Record<string, unknown>);
    logHttpRequest({ method: 'POST', url: fullUrl, body: snakeCaseData });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingAssignmentResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingAssignment(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async getParkingReservations(params: GetParkingReservationsParams): Promise<ParkingReservationsPaginated> {
    const url = `${this.baseUrl}/horizontal-properties/parking/reservations`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    if (params.parkingSlotId) {
      queryParams.append('parking_slot_id', params.parkingSlotId.toString());
    }
    if (params.propertyUnitId) {
      queryParams.append('property_unit_id', params.propertyUnitId.toString());
    }
    if (params.residentId) {
      queryParams.append('resident_id', params.residentId.toString());
    }
    if (params.visitorId) {
      queryParams.append('visitor_id', params.visitorId.toString());
    }
    if (params.reservationStatusId) {
      queryParams.append('reservation_status_id', params.reservationStatusId.toString());
    }
    if (params.startDate) {
      queryParams.append('start_date', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('end_date', params.endDate);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append('page_size', params.pageSize.toString());
    }

    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    logHttpRequest({ method: 'GET', url: fullUrl });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendParkingReservationsPaginatedResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return {
        data: data.data.map((reservation) => this.mapBackendParkingReservationList(reservation)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async createParkingReservation(params: { businessId: number; token: string; data: CreateParkingReservationDTO }): Promise<ParkingReservation> {
    const url = `${this.baseUrl}/horizontal-properties/parking/reservations`;
    const queryParams = new URLSearchParams();
    queryParams.append('business_id', params.businessId.toString());
    const fullUrl = `${url}?${queryParams.toString()}`;
    const startTime = Date.now();
    const snakeCaseData = this.convertToSnakeCase(params.data as unknown as Record<string, unknown>);
    logHttpRequest({ method: 'POST', url: fullUrl, body: snakeCaseData });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingReservationResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async checkParkingAvailability(params: { token: string; data: CheckParkingAvailabilityDTO }): Promise<{ available: boolean; message?: string }> {
    const url = `${this.baseUrl}/horizontal-properties/parking/check-availability`;
    const startTime = Date.now();
    const snakeCaseData = this.convertToSnakeCase(params.data as unknown as Record<string, unknown>);
    logHttpRequest({ method: 'POST', url, body: snakeCaseData });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendCheckParkingAvailabilityResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return {
        available: result.available,
        message: result.message,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async checkInParking(params: { id: number; token: string }): Promise<ParkingReservation> {
    const url = `${this.baseUrl}/horizontal-properties/parking/reservations/${params.id}/check-in`;
    const startTime = Date.now();
    logHttpRequest({ method: 'POST', url });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingReservationResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async checkOutParking(params: { id: number; token: string }): Promise<ParkingReservation> {
    const url = `${this.baseUrl}/horizontal-properties/parking/reservations/${params.id}/check-out`;
    const startTime = Date.now();
    logHttpRequest({ method: 'POST', url });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingReservationResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async cancelParkingReservation(params: { id: number; token: string; reason?: string }): Promise<ParkingReservation> {
    const url = `${this.baseUrl}/horizontal-properties/parking/reservations/${params.id}/cancel`;
    const startTime = Date.now();
    logHttpRequest({ method: 'POST', url, body: { reason: params.reason } });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: params.reason || '' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BackendParkingReservationResponse = await response.json();
      const duration = Date.now() - startTime;
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });

      return this.mapBackendParkingReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Error', duration, data: { error: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }
}
