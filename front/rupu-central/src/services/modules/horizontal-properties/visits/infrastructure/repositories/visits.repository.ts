/**
 * Implementación del repositorio de Visitas
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IVisitsRepository,
  SearchVisitorParams,
  GetVisitsParams,
  GetVisitByIdParams,
  GetVisitByQRCodeParams,
  CreateVisitParams,
  RegisterEntryParams,
  RegisterExitParams,
  RegisterAssetsParams,
  CreateVisitorParams,
  Visitor,
  Visit,
  VisitListDTO,
  VisitsPaginated,
} from '../../domain';
import {
  BackendVisitorResponse,
  BackendVisitResponse,
  BackendVisitsPaginatedResponse,
  BackendVisitor,
  BackendVisit,
  BackendVisitList,
} from './response/visits.response';

export class VisitsRepository implements IVisitsRepository {
  private baseUrl = env.API_BASE_URL;

  private mapBackendVisitor(visitor: BackendVisitor): Visitor {
    return {
      id: visitor.id,
      businessId: visitor.business_id,
      dni: visitor.dni,
      fullName: visitor.full_name,
      phone: visitor.phone,
      email: visitor.email,
      photoUrl: visitor.photo_url,
      hasBlacklist: visitor.has_blacklist,
      isVerified: visitor.is_verified,
      lastVisitAt: visitor.last_visit_at,
      totalVisits: visitor.total_visits,
      notes: visitor.notes,
      createdAt: visitor.created_at,
      updatedAt: visitor.updated_at,
    };
  }

  private mapBackendVisit(visit: BackendVisit): Visit {
    return {
      id: visit.id,
      businessId: visit.business_id,
      visitorId: visit.visitor_id,
      propertyUnitId: visit.property_unit_id,
      residentId: visit.resident_id,
      visitTypeId: visit.visit_type_id,
      visitStatusId: visit.visit_status_id,
      visitorVehicleId: visit.visitor_vehicle_id,
      scheduledDate: visit.scheduled_date,
      scheduledStartTime: visit.scheduled_start_time,
      scheduledEndTime: visit.scheduled_end_time,
      actualEntryTime: visit.actual_entry_time,
      actualExitTime: visit.actual_exit_time,
      durationMinutes: visit.duration_minutes,
      authorizationCode: visit.authorization_code,
      qrCode: visit.qr_code,
      qrCodeExpiresAt: visit.qr_code_expires_at,
      authorizedByResidentId: visit.authorized_by_resident_id,
      authorizationDate: visit.authorization_date,
      authorizationExpiresAt: visit.authorization_expires_at,
      registeredByUserId: visit.registered_by_user_id,
      entryRegisteredByUserId: visit.entry_registered_by_user_id,
      exitRegisteredByUserId: visit.exit_registered_by_user_id,
      entryGate: visit.entry_gate,
      exitGate: visit.exit_gate,
      entryMethod: visit.entry_method as 'qr_code' | 'manual' | 'ocr' | 'lpr' | undefined,
      purpose: visit.purpose,
      numberOfVisitors: visit.number_of_visitors,
      hasCompanions: visit.has_companions,
      hasAssets: visit.has_assets,
      notes: visit.notes,
      isRecurring: visit.is_recurring,
      recurringPatternId: visit.recurring_pattern_id,
      parentVisitId: visit.parent_visit_id,
      durationExceeded: visit.duration_exceeded,
      durationExceededAt: visit.duration_exceeded_at,
      alertSent: visit.alert_sent,
      notifyResident: visit.notify_resident,
      notifySecurity: visit.notify_security,
      notificationSentAt: visit.notification_sent_at,
      createdAt: visit.created_at,
      updatedAt: visit.updated_at,
    };
  }

  private mapBackendVisitList(visit: BackendVisitList): VisitListDTO {
    return {
      id: visit.id,
      visitorName: visit.visitor_name,
      visitorDni: visit.visitor_dni,
      propertyUnitNumber: visit.property_unit_number,
      visitTypeName: visit.visit_type_name,
      visitStatusName: visit.visit_status_name,
      scheduledDate: visit.scheduled_date,
      actualEntryTime: visit.actual_entry_time,
      actualExitTime: visit.actual_exit_time,
      createdAt: visit.created_at,
    };
  }

  async searchVisitor(params: SearchVisitorParams): Promise<Visitor> {
    const { businessId, dni, token } = params;

    const queryParams = new URLSearchParams();
    queryParams.set('dni', dni);

    const url = `${this.baseUrl}/horizontal-properties/visits/search-visitor?${queryParams.toString()}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error buscando visitante: ${response.statusText}`);
      }

      const data: BackendVisitorResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendVisitor(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async getVisits(params: GetVisitsParams): Promise<VisitsPaginated> {
    const {
      businessId,
      token,
      page = 1,
      pageSize = 10,
      visitorId,
      propertyUnitId,
      residentId,
      visitTypeId,
      visitStatusId,
      startDate,
      endDate,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('page_size', pageSize.toString());

    if (visitorId) queryParams.append('visitor_id', visitorId.toString());
    if (propertyUnitId) queryParams.append('property_unit_id', propertyUnitId.toString());
    if (residentId) queryParams.append('resident_id', residentId.toString());
    if (visitTypeId) queryParams.append('visit_type_id', visitTypeId.toString());
    if (visitStatusId) queryParams.append('visit_status_id', visitStatusId.toString());
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    const url = `${this.baseUrl}/horizontal-properties/visits?${queryParams.toString()}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        const errorMessage = errorData.message || errorData.error || `Error obteniendo visitas: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data: BackendVisitsPaginatedResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        visits: data.data.map((v) => this.mapBackendVisitList(v)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async getVisitById(params: GetVisitByIdParams): Promise<Visit> {
    const { businessId, visitId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo visita: ${response.statusText}`);
      }

      const data: BackendVisitResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendVisit(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async getVisitByQRCode(params: GetVisitByQRCodeParams): Promise<Visit> {
    const { qrCode, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/qr/${qrCode}`;
    const method = 'GET';
    const startTime = Date.now();

    logHttpRequest({ method, url });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo visita por QR: ${response.statusText}`);
      }

      const data: BackendVisitResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendVisit(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async createVisit(params: CreateVisitParams): Promise<Visit> {
    const { businessId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error creando visita: ${response.statusText}`);
      }

      const result: BackendVisitResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return this.mapBackendVisit(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async registerEntry(params: RegisterEntryParams): Promise<Visit> {
    const { businessId, visitId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/register-entry`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error registrando entrada: ${response.statusText}`);
      }

      const result: BackendVisitResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return this.mapBackendVisit(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async registerExit(params: RegisterExitParams): Promise<Visit> {
    const { businessId, visitId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/register-exit`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error registrando salida: ${response.statusText}`);
      }

      const result: BackendVisitResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return this.mapBackendVisit(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async registerAssets(params: RegisterAssetsParams): Promise<void> {
    const { businessId, visitId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/assets`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error registrando activos: ${response.statusText}`);
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }

  async createVisitor(params: CreateVisitorParams): Promise<Visitor> {
    const { businessId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/visitors`;
    const method = 'POST';
    const startTime = Date.now();

    logHttpRequest({ method, url, body: data });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: data.dni,
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error creando visitante: ${response.statusText}`);
      }

      const result: BackendVisitorResponse = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return this.mapBackendVisitor(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: String(error) },
      });
      throw error;
    }
  }
}
