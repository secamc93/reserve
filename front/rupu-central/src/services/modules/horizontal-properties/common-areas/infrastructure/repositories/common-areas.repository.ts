/**
 * Implementación del repositorio de Zonas Comunes y Reservas
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  ICommonAreasRepository,
  GetCommonAreasParams,
  GetCommonAreaByIdParams,
  CreateCommonAreaParams,
  CreateReservationParams,
  CheckAvailabilityParams,
  GetReservationsParams,
  GetReservationByIdParams,
  ApproveReservationParams,
  RejectReservationParams,
  CheckInReservationParams,
  CheckOutReservationParams,
  CancelReservationParams,
  CommonArea,
  CommonAreaListDTO,
  CommonAreasPaginated,
  CommonAreaReservation,
  ReservationListDTO,
  ReservationsPaginated,
  CommonAreaType,
} from '../../domain';
import {
  BackendCommonAreaResponse,
  BackendCommonAreasPaginatedResponse,
  BackendCommonArea,
  BackendCommonAreaList,
  BackendReservationResponse,
  BackendReservationsPaginatedResponse,
  BackendReservation,
  BackendReservationList,
  BackendCheckAvailabilityResponse,
  BackendCommonAreaType,
  BackendCommonAreaTypesResponse,
} from './response/common-areas.response';

export class CommonAreasRepository implements ICommonAreasRepository {
  private baseUrl = env.API_BASE_URL;

  private mapBackendCommonArea(area: BackendCommonArea): CommonArea {
    return {
      id: area.id,
      businessId: area.business_id,
      commonAreaTypeId: area.common_area_type_id,
      name: area.name,
      description: area.description,
      location: area.location,
      maxCapacity: area.max_capacity,
      areaSqm: area.area_sqm,
      hasEquipment: area.has_equipment,
      equipmentDescription: area.equipment_description,
      hourlyRate: area.hourly_rate,
      requiresApproval: area.requires_approval,
      requiresDeposit: area.requires_deposit,
      depositAmount: area.deposit_amount,
      allowsRecurring: area.allows_recurring,
      isActive: area.is_active,
      imageUrls: area.image_urls,
      createdAt: area.created_at,
      updatedAt: area.updated_at,
    };
  }

  private mapBackendCommonAreaList(area: BackendCommonAreaList): CommonAreaListDTO {
    return {
      id: area.id,
      name: area.name,
      typeName: area.type_name,
      location: area.location,
      maxCapacity: area.max_capacity,
      isActive: area.is_active,
      requiresApproval: area.requires_approval,
    };
  }

  private mapBackendReservation(reservation: BackendReservation): CommonAreaReservation {
    return {
      id: reservation.id,
      businessId: reservation.business_id,
      commonAreaId: reservation.common_area_id,
      commonAreaName: reservation.common_area_name,
      propertyUnitId: reservation.property_unit_id,
      propertyUnitNumber: reservation.property_unit_number,
      residentId: reservation.resident_id,
      residentName: reservation.resident_name,
      reservationStatusId: reservation.reservation_status_id,
      statusName: reservation.status_name,
      reservationDate: reservation.reservation_date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      durationHours: reservation.duration_hours,
      requiresApproval: reservation.requires_approval,
      approvedByUserId: reservation.approved_by_user_id,
      approvedAt: reservation.approved_at,
      rejectedByUserId: reservation.rejected_by_user_id,
      rejectedAt: reservation.rejected_at,
      rejectionReason: reservation.rejection_reason,
      numberOfGuests: reservation.number_of_guests,
      purpose: reservation.purpose,
      specialRequests: reservation.special_requests,
      isRecurring: reservation.is_recurring,
      recurringPatternId: reservation.recurring_pattern_id,
      parentReservationId: reservation.parent_reservation_id,
      totalAmount: reservation.total_amount,
      depositAmount: reservation.deposit_amount,
      depositPaid: reservation.deposit_paid,
      depositPaidAt: reservation.deposit_paid_at,
      fullPaymentPaid: reservation.full_payment_paid,
      fullPaymentPaidAt: reservation.full_payment_paid_at,
      qrCode: reservation.qr_code,
      accessCode: reservation.access_code,
      checkedInAt: reservation.checked_in_at,
      checkedOutAt: reservation.checked_out_at,
      checkedInByUserId: reservation.checked_in_by_user_id,
      checkedOutByUserId: reservation.checked_out_by_user_id,
      notifyResident: reservation.notify_resident,
      notifyAdmin: reservation.notify_admin,
      notificationSentAt: reservation.notification_sent_at,
      reminderSentAt: reservation.reminder_sent_at,
      cancelledAt: reservation.cancelled_at,
      cancelledByUserId: reservation.cancelled_by_user_id,
      cancellationReason: reservation.cancellation_reason,
      refundAmount: reservation.refund_amount,
      notes: reservation.notes,
      residentNotes: reservation.resident_notes,
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at,
    };
  }

  private mapBackendReservationList(reservation: BackendReservationList): ReservationListDTO {
    return {
      id: reservation.id,
      commonAreaName: reservation.common_area_name,
      propertyUnitNumber: reservation.property_unit_number,
      residentName: reservation.resident_name,
      statusName: reservation.status_name,
      reservationDate: reservation.reservation_date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      numberOfGuests: reservation.number_of_guests,
      createdAt: reservation.created_at,
    };
  }

  async getCommonAreaTypes(token: string): Promise<CommonAreaType[]> {
    const url = `${this.baseUrl}/horizontal-properties/common-areas/types`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || errorData.error || response.statusText || 'Error obteniendo tipos de zonas comunes');
      }

      const result: BackendCommonAreaTypesResponse = await response.json();

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return result.data.map((type) => ({
        id: type.id,
        name: type.name,
        code: type.code,
        description: type.description,
        icon: type.icon,
        defaultMaxCapacity: type.default_max_capacity,
        requiresApproval: type.requires_approval,
        allowsRecurring: type.allows_recurring,
        isActive: type.is_active,
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async getCommonAreas(params: GetCommonAreasParams): Promise<CommonAreasPaginated> {
    const { businessId, token, commonAreaTypeId, isActive, page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    if (commonAreaTypeId) queryParams.set('common_area_type_id', commonAreaTypeId.toString());
    if (isActive !== undefined) queryParams.set('is_active', isActive.toString());

    const url = `${this.baseUrl}/horizontal-properties/common-areas?${queryParams.toString()}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || errorData.error || response.statusText || 'Error obteniendo zonas comunes');
      }

      const result: BackendCommonAreasPaginatedResponse = await response.json();

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return {
        data: result.data.map((area) => this.mapBackendCommonAreaList(area)),
        total: result.total,
        page: result.page,
        pageSize: result.page_size,
        totalPages: result.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async getCommonAreaById(params: GetCommonAreaByIdParams): Promise<CommonArea> {
    const { id, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/${id}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result: BackendCommonAreaResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error obteniendo zona común');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendCommonArea(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async createCommonArea(params: CreateCommonAreaParams): Promise<CommonArea> {
    const { data, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result: BackendCommonAreaResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error creando zona común');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendCommonArea(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async createReservation(params: CreateReservationParams): Promise<CommonAreaReservation> {
    const { data, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error creando reserva');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async checkAvailability(params: CheckAvailabilityParams): Promise<{ available: boolean; message?: string }> {
    const { data, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/check-availability`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result: BackendCheckAvailabilityResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error verificando disponibilidad');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return {
        available: result.available,
        message: result.message,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async getReservations(params: GetReservationsParams): Promise<ReservationsPaginated> {
    const {
      businessId,
      token,
      commonAreaId,
      propertyUnitId,
      residentId,
      reservationStatusId,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());
    if (commonAreaId) queryParams.set('common_area_id', commonAreaId.toString());
    if (propertyUnitId) queryParams.set('property_unit_id', propertyUnitId.toString());
    if (residentId) queryParams.set('resident_id', residentId.toString());
    if (reservationStatusId) queryParams.set('reservation_status_id', reservationStatusId.toString());
    if (startDate) queryParams.set('start_date', startDate);
    if (endDate) queryParams.set('end_date', endDate);

    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations?${queryParams.toString()}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || errorData.error || response.statusText || 'Error obteniendo reservas');
      }

      const result: BackendReservationsPaginatedResponse = await response.json();

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return {
        data: result.data.map((reservation) => this.mapBackendReservationList(reservation)),
        total: result.total,
        page: result.page,
        pageSize: result.page_size,
        totalPages: result.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async getReservationById(params: GetReservationByIdParams): Promise<CommonAreaReservation> {
    const { id, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error obteniendo reserva');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async approveReservation(params: ApproveReservationParams): Promise<CommonAreaReservation> {
    const { id, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}/approve`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error aprobando reserva');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async rejectReservation(params: RejectReservationParams): Promise<CommonAreaReservation> {
    const { id, reason, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}/reject`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error rechazando reserva');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async checkInReservation(params: CheckInReservationParams): Promise<CommonAreaReservation> {
    const { id, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}/check-in`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error registrando check-in');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async checkOutReservation(params: CheckOutReservationParams): Promise<CommonAreaReservation> {
    const { id, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}/check-out`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error registrando check-out');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  async cancelReservation(params: CancelReservationParams): Promise<CommonAreaReservation> {
    const { id, reason, token } = params;
    const url = `${this.baseUrl}/horizontal-properties/common-areas/reservations/${id}/cancel`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const result: BackendReservationResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error cancelando reserva');
      }

      logHttpSuccess({ 
        status: response.status, 
        statusText: response.statusText, 
        duration: Date.now() - startTime 
      });

      return this.mapBackendReservation(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ 
        status: 0, 
        statusText: 'Error', 
        duration,
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }
}
