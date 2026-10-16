/**
 * Repositorio HTTP de zonas comunes y reservas (corre en el servidor, desde Server Actions).
 * Cada petición lleva ?business_id= para que el super admin opere sobre la propiedad
 * elegida; para un usuario normal el back usa siempre el de su token.
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import type {
  ICommonAreasRepository,
  GetCommonAreasParams,
  GetCommonAreaByIdParams,
  CreateCommonAreaParams,
  UpdateCommonAreaParams,
  DeleteCommonAreaParams,
  SetSchedulesParams,
  CreateRestrictionParams,
  DeleteRestrictionParams,
  SearchUnitsParams,
  CreateReservationParams,
  CheckAvailabilityParams,
  GetReservationsParams,
  ReservationIdParams,
  RejectReservationParams,
  CancelReservationParams,
  UpdatePaymentsParams,
  CommonArea,
  CommonAreasPaginated,
  CommonAreaReservation,
  ReservationsPaginated,
  CommonAreaType,
  CommonAreaSchedule,
  CommonAreaRestriction,
  UnitLookup,
} from '../../domain';
import type {
  BackendCommonArea,
  BackendCommonAreaType,
  BackendCommonAreasPaginatedResponse,
  BackendReservation,
  BackendReservationsPaginatedResponse,
  BackendCheckAvailabilityResponse,
  BackendSchedule,
  BackendRestriction,
  BackendUnitLookup,
} from './response/common-areas.response';
import {
  mapCommonArea,
  mapCommonAreaList,
  mapCommonAreaType,
  mapReservation,
  mapReservationList,
  mapRestriction,
  mapSchedule,
  mapUnit,
  toBackendArea,
} from './mappers';

type Query = Record<string, string | number | boolean | undefined | null>;

const BASE = '/horizontal-properties/common-areas';

export class CommonAreasRepository implements ICommonAreasRepository {
  private baseUrl = env.API_BASE_URL;

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    opts: { token: string; query?: Query; body?: unknown; fallbackError: string },
  ): Promise<T> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
    const url = `${this.baseUrl}${path}${qs.toString() ? `?${qs.toString()}` : ''}`;
    const startTime = Date.now();
    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.token}` },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        cache: 'no-store',
      });
      const json = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(json.message || json.error || response.statusText || opts.fallbackError);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration: Date.now() - startTime });
      return json as T;
    } catch (error) {
      logHttpError({
        status: 0,
        statusText: 'Error',
        duration: Date.now() - startTime,
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  // ===================== Zonas =====================

  async getCommonAreaTypes(token: string): Promise<CommonAreaType[]> {
    const res = await this.request<{ data: BackendCommonAreaType[] }>('GET', `${BASE}/types`, {
      token,
      fallbackError: 'Error obteniendo tipos de zonas comunes',
    });
    return (res.data ?? []).map(mapCommonAreaType);
  }

  async getCommonAreas(params: GetCommonAreasParams): Promise<CommonAreasPaginated> {
    const { businessId, token, commonAreaTypeId, isActive, search, page = 1, pageSize = 10 } = params;
    const res = await this.request<BackendCommonAreasPaginatedResponse>('GET', BASE, {
      token,
      query: {
        business_id: businessId,
        page,
        page_size: pageSize,
        common_area_type_id: commonAreaTypeId,
        is_active: isActive,
        search: search?.trim(),
      },
      fallbackError: 'Error obteniendo zonas comunes',
    });
    return {
      data: (res.data ?? []).map(mapCommonAreaList),
      total: res.total,
      page: res.page,
      pageSize: res.page_size,
      totalPages: res.total_pages,
    };
  }

  async getCommonAreaById({ businessId, token, id }: GetCommonAreaByIdParams): Promise<CommonArea> {
    const res = await this.request<{ data: BackendCommonArea }>('GET', `${BASE}/${id}`, {
      token,
      query: { business_id: businessId },
      fallbackError: 'Error obteniendo zona común',
    });
    return mapCommonArea(res.data);
  }

  async createCommonArea({ businessId, token, data }: CreateCommonAreaParams): Promise<CommonArea> {
    const res = await this.request<{ data: BackendCommonArea }>('POST', BASE, {
      token,
      query: { business_id: businessId },
      body: toBackendArea({ ...data }),
      fallbackError: 'Error creando zona común',
    });
    return mapCommonArea(res.data);
  }

  async updateCommonArea({ businessId, token, id, data }: UpdateCommonAreaParams): Promise<CommonArea> {
    const body = toBackendArea({ ...data });
    // En edición los montos vacíos se envían como null para borrarlos.
    for (const key of ['area_sqm', 'hourly_rate', 'deposit_amount']) if (!(key in body)) body[key] = null;
    const res = await this.request<{ data: BackendCommonArea }>('PUT', `${BASE}/${id}`, {
      token,
      query: { business_id: businessId },
      body,
      fallbackError: 'Error actualizando zona común',
    });
    return mapCommonArea(res.data);
  }

  async deleteCommonArea({ businessId, token, id }: DeleteCommonAreaParams): Promise<void> {
    await this.request('DELETE', `${BASE}/${id}`, { token, query: { business_id: businessId }, fallbackError: 'Error eliminando zona común' });
  }

  async getSchedules({ businessId, token, id }: GetCommonAreaByIdParams): Promise<CommonAreaSchedule[]> {
    const res = await this.request<{ data: BackendSchedule[] | null }>('GET', `${BASE}/${id}/schedules`, {
      token,
      query: { business_id: businessId },
      fallbackError: 'Error obteniendo horarios',
    });
    return (res.data ?? []).map(mapSchedule);
  }

  async setSchedules({ businessId, token, id, schedules }: SetSchedulesParams): Promise<CommonAreaSchedule[]> {
    const res = await this.request<{ data: BackendSchedule[] | null }>('PUT', `${BASE}/${id}/schedules`, {
      token,
      query: { business_id: businessId },
      body: {
        schedules: schedules.map((s) => ({ day_of_week: s.dayOfWeek, start_time: s.startTime, end_time: s.endTime, is_active: s.isActive })),
      },
      fallbackError: 'Error guardando horarios',
    });
    return (res.data ?? []).map(mapSchedule);
  }

  async getRestrictions({ businessId, token, id }: GetCommonAreaByIdParams): Promise<CommonAreaRestriction[]> {
    const res = await this.request<{ data: BackendRestriction[] | null }>('GET', `${BASE}/${id}/restrictions`, {
      token,
      query: { business_id: businessId },
      fallbackError: 'Error obteniendo bloqueos',
    });
    return (res.data ?? []).map(mapRestriction);
  }

  async createRestriction({ businessId, token, id, data }: CreateRestrictionParams): Promise<CommonAreaRestriction> {
    const res = await this.request<{ data: BackendRestriction }>('POST', `${BASE}/${id}/restrictions`, {
      token,
      query: { business_id: businessId },
      body: {
        restriction_type: data.restrictionType,
        start_date: data.startDate,
        end_date: data.endDate,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        reason: data.reason ?? '',
      },
      fallbackError: 'Error creando bloqueo',
    });
    return mapRestriction(res.data);
  }

  async deleteRestriction({ businessId, token, id, restrictionId }: DeleteRestrictionParams): Promise<void> {
    await this.request('DELETE', `${BASE}/${id}/restrictions/${restrictionId}`, {
      token,
      query: { business_id: businessId },
      fallbackError: 'Error eliminando bloqueo',
    });
  }

  async searchUnits({ businessId, token, search, limit }: SearchUnitsParams): Promise<UnitLookup[]> {
    const res = await this.request<{ data: BackendUnitLookup[] | null }>('GET', `${BASE}/units`, {
      token,
      query: { business_id: businessId, search: search?.trim(), limit },
      fallbackError: 'Error buscando unidades',
    });
    return (res.data ?? []).map(mapUnit);
  }

  // ===================== Reservas =====================

  async createReservation({ businessId, token, data }: CreateReservationParams): Promise<CommonAreaReservation> {
    const res = await this.request<{ data: BackendReservation }>('POST', `${BASE}/reservations`, {
      token,
      query: { business_id: businessId },
      body: {
        common_area_id: data.commonAreaId,
        property_unit_id: data.propertyUnitId,
        resident_id: data.residentId,
        reservation_date: data.reservationDate,
        start_time: data.startTime,
        end_time: data.endTime,
        number_of_guests: data.numberOfGuests,
        purpose: data.purpose ?? '',
        special_requests: data.specialRequests ?? '',
        is_recurring: data.isRecurring ?? false,
      },
      fallbackError: 'Error creando reserva',
    });
    return mapReservation(res.data);
  }

  async checkAvailability({ businessId, token, data }: CheckAvailabilityParams): Promise<{ available: boolean; message?: string }> {
    const res = await this.request<BackendCheckAvailabilityResponse>('POST', `${BASE}/check-availability`, {
      token,
      query: { business_id: businessId },
      body: { common_area_id: data.commonAreaId, reservation_date: data.reservationDate, start_time: data.startTime, end_time: data.endTime },
      fallbackError: 'Error verificando disponibilidad',
    });
    return { available: res.available, message: res.message };
  }

  async getReservations(params: GetReservationsParams): Promise<ReservationsPaginated> {
    const { businessId, token, commonAreaId, propertyUnitId, residentId, reservationStatusId, status, startDate, endDate, page = 1, pageSize = 10 } = params;
    const res = await this.request<BackendReservationsPaginatedResponse>('GET', `${BASE}/reservations`, {
      token,
      query: {
        business_id: businessId,
        page,
        page_size: pageSize,
        common_area_id: commonAreaId,
        property_unit_id: propertyUnitId,
        resident_id: residentId,
        reservation_status_id: reservationStatusId,
        status: status && status.length ? status.join(',') : undefined,
        start_date: startDate ? `${startDate}T00:00:00Z` : undefined,
        end_date: endDate ? `${endDate}T00:00:00Z` : undefined,
      },
      fallbackError: 'Error obteniendo reservas',
    });
    return {
      data: (res.data ?? []).map(mapReservationList),
      total: res.total,
      page: res.page,
      pageSize: res.page_size,
      totalPages: res.total_pages,
    };
  }

  async getReservationById({ businessId, token, id }: ReservationIdParams): Promise<CommonAreaReservation> {
    const res = await this.request<{ data: BackendReservation }>('GET', `${BASE}/reservations/${id}`, {
      token,
      query: { business_id: businessId },
      fallbackError: 'Error obteniendo reserva',
    });
    return mapReservation(res.data);
  }

  private async reservationAction(path: string, p: ReservationIdParams, fallbackError: string, body?: unknown, method: 'POST' | 'PUT' = 'POST') {
    const res = await this.request<{ data: BackendReservation }>(method, `${BASE}/reservations/${p.id}/${path}`, {
      token: p.token,
      query: { business_id: p.businessId },
      body,
      fallbackError,
    });
    return mapReservation(res.data);
  }

  approveReservation(p: ReservationIdParams) {
    return this.reservationAction('approve', p, 'Error aprobando reserva');
  }

  rejectReservation(p: RejectReservationParams) {
    return this.reservationAction('reject', p, 'Error rechazando reserva', { reason: p.reason });
  }

  confirmReservation(p: ReservationIdParams) {
    return this.reservationAction('confirm', p, 'Error confirmando reserva');
  }

  checkInReservation(p: ReservationIdParams) {
    return this.reservationAction('check-in', p, 'Error registrando check-in');
  }

  checkOutReservation(p: ReservationIdParams) {
    return this.reservationAction('check-out', p, 'Error registrando check-out');
  }

  cancelReservation(p: CancelReservationParams) {
    return this.reservationAction('cancel', p, 'Error cancelando reserva', { reason: p.reason ?? '' });
  }

  updatePayments(p: UpdatePaymentsParams) {
    return this.reservationAction(
      'payments',
      p,
      'Error actualizando pagos',
      { deposit_paid: p.data.depositPaid, full_payment_paid: p.data.fullPaymentPaid },
      'PUT',
    );
  }
}
