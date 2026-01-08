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
  UpdateVisitParams,
  DeleteVisitParams,
  RegisterEntryParams,
  RegisterExitParams,
  RegisterAssetsParams,
  CreateVisitorParams,
  GetVisitTypesParams,
  GetVisitStatusesParams,
  GetCompanionsParams,
  CreateCompanionParams,
  DeleteCompanionParams,
  Visitor,
  Visit,
  VisitListDTO,
  VisitsPaginated,
  VisitType,
  VisitStatus,
  VisitCompanion,
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

    // Función helper para formatear fechas al formato ISO 8601 completo que espera el backend
    const formatDateForBackend = (dateStr: string | undefined): string | undefined => {
      if (!dateStr) return undefined;
      
      try {
        // Si solo es fecha (YYYY-MM-DD), convertir a timestamp completo
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return `${dateStr}T00:00:00Z`;
        }
        // Si es un timestamp parcial (YYYY-MM-DDTHH:mm), agregar segundos y zona horaria
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          return `${dateStr}:00Z`;
        }
        // Si es un timestamp sin zona horaria (YYYY-MM-DDTHH:mm:ss), agregar Z
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
          return `${dateStr}Z`;
        }
        // Si ya es un timestamp completo, devolverlo tal cual
        if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+'))) {
          return dateStr;
        }
        
        // Intentar parsear como fecha y convertir a ISO
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        console.error('Error formateando fecha:', e);
      }
      
      return dateStr;
    };

    // Transformar datos de camelCase a snake_case para el backend y formatear fechas
    const backendData: any = {
      visitor_id: data.visitorId,
      property_unit_id: data.propertyUnitId,
      resident_id: data.residentId || undefined,
      visit_type_id: data.visitTypeId,
      visitor_vehicle_id: data.visitorVehicleId || undefined,
      scheduled_date: formatDateForBackend(data.scheduledDate),
      scheduled_start_time: formatDateForBackend(data.scheduledStartTime),
      scheduled_end_time: formatDateForBackend(data.scheduledEndTime),
      purpose: data.purpose || undefined,
      number_of_visitors: data.numberOfVisitors || 1,
      has_companions: data.hasCompanions || false,
      has_assets: data.hasAssets || false,
      notes: data.notes || undefined,
      notify_resident: data.notifyResident ?? true,
      notify_security: data.notifySecurity ?? false,
    };

    // Remover campos undefined para no enviarlos al backend
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    logHttpRequest({ method, url, body: backendData });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
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
        
        // Parsear errores de validación del backend
        const errorMessage = this.parseValidationErrors(errorData);
        throw new Error(errorMessage);
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

  /**
   * Parsea los errores de validación del backend y los convierte en mensajes más amigables en español
   */
  private parseValidationErrors(errorData: any): string {
    if (!errorData || !errorData.error) {
      return errorData.message || 'Error desconocido al crear la visita';
    }

    const errorString = errorData.error;
    if (typeof errorString !== 'string') {
      return errorData.message || 'Error desconocido al crear la visita';
    }

    // Detectar errores de parsing de fecha/hora
    if (errorString.includes('parsing time') || errorString.includes('cannot parse')) {
      if (errorString.includes('scheduled_date') || errorString.includes('scheduledDate') || errorString.includes('ScheduledDate')) {
        return 'La fecha programada tiene un formato inválido. Por favor use el formato: YYYY-MM-DD';
      }
      if (errorString.includes('scheduled_start_time') || errorString.includes('scheduledStartTime') || errorString.includes('ScheduledStartTime')) {
        return 'La hora de inicio tiene un formato inválido. Por favor use el formato: YYYY-MM-DDTHH:mm:ss o YYYY-MM-DDTHH:mm:ssZ';
      }
      if (errorString.includes('scheduled_end_time') || errorString.includes('scheduledEndTime') || errorString.includes('ScheduledEndTime')) {
        return 'La hora de fin tiene un formato inválido. Por favor use el formato: YYYY-MM-DDTHH:mm:ss o YYYY-MM-DDTHH:mm:ssZ';
      }
      return 'El formato de fecha u hora es inválido. Por favor verifique los campos de fecha y hora';
    }

    // Mapear nombres de campos del backend a mensajes amigables
    const fieldMap: { [key: string]: string } = {
      'VisitorID': 'ID del visitante',
      'visitor_id': 'ID del visitante',
      'PropertyUnitID': 'Unidad de propiedad',
      'property_unit_id': 'Unidad de propiedad',
      'VisitTypeID': 'Tipo de visita',
      'visit_type_id': 'Tipo de visita',
      'ScheduledDate': 'Fecha programada',
      'scheduled_date': 'Fecha programada',
      'ScheduledStartTime': 'Hora de inicio',
      'scheduled_start_time': 'Hora de inicio',
      'ScheduledEndTime': 'Hora de fin',
      'scheduled_end_time': 'Hora de fin',
      'Purpose': 'Propósito',
      'purpose': 'Propósito',
      'NumberOfVisitors': 'Número de visitantes',
      'number_of_visitors': 'Número de visitantes',
    };

    // Extraer errores específicos
    const errors: string[] = [];
    const errorLines = errorString.split('\n').filter(line => line.trim());

    for (const line of errorLines) {
      // Buscar patrones como "Key: 'CreateVisitRequest.VisitorID' Error:Field validation for 'VisitorID' failed on the 'required' tag"
      const keyMatch = line.match(/Key: ['"].*?\.(\w+)['"]|Field validation for ['"](\w+)['"]/);
      if (keyMatch) {
        const fieldName = keyMatch[1] || keyMatch[2];
        const friendlyName = fieldMap[fieldName] || fieldName;
        
        if (line.includes('required')) {
          errors.push(`${friendlyName} es requerido`);
        } else if (line.includes('min')) {
          errors.push(`${friendlyName} no cumple con el valor mínimo`);
        } else if (line.includes('max')) {
          errors.push(`${friendlyName} excede el valor máximo`);
        } else if (line.includes('email')) {
          errors.push(`${friendlyName} no es un email válido`);
        } else {
          errors.push(`${friendlyName}: ${line.split('Error:')[1]?.trim() || 'valor inválido'}`);
        }
      }
    }

    if (errors.length > 0) {
      return `Por favor corrija los siguientes errores:\n• ${errors.join('\n• ')}`;
    }

    // Si no se pudieron parsear, devolver el mensaje original traducido o el error completo
    // Intentar traducir mensajes comunes en inglés a español
    const translatedError = this.translateError(errorString);
    return errorData.message || translatedError;
  }

  /**
   * Traduce mensajes de error comunes del inglés al español
   */
  private translateError(errorString: string): string {
    const translations: { [key: string]: string } = {
      'parsing time': 'Error al procesar la fecha u hora',
      'cannot parse': 'No se pudo procesar el formato',
      'required': 'es requerido',
      'invalid': 'inválido',
      'not found': 'no encontrado',
      'already exists': 'ya existe',
      'unauthorized': 'no autorizado',
      'forbidden': 'prohibido',
      'internal server error': 'error interno del servidor',
    };

    let translated = errorString.toLowerCase();
    for (const [english, spanish] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(english, 'gi'), spanish);
    }

    // Capitalizar primera letra
    return translated.charAt(0).toUpperCase() + translated.slice(1);
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

  async updateVisit(params: UpdateVisitParams): Promise<Visit> {
    const { businessId, visitId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}`;
    const method = 'PUT';
    const startTime = Date.now();

    // Convertir camelCase a snake_case para el backend
    const backendData = {
      property_unit_id: data.propertyUnitId,
      resident_id: data.residentId,
      visit_type_id: data.visitTypeId,
      scheduled_date: data.scheduledDate,
      scheduled_start_time: data.scheduledStartTime,
      scheduled_end_time: data.scheduledEndTime,
      purpose: data.purpose,
      number_of_visitors: data.numberOfVisitors,
      notes: data.notes,
      notify_resident: data.notifyResident,
      notify_security: data.notifySecurity,
    };

    logHttpRequest({ method, url, body: backendData });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
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
        throw new Error(errorData.message || `Error actualizando visita: ${response.statusText}`);
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

  async deleteVisit(params: DeleteVisitParams): Promise<void> {
    const { businessId, visitId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}`;
    const method = 'DELETE';
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
        throw new Error(errorData.message || `Error eliminando visita: ${response.statusText}`);
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

  async getVisitTypes(params: GetVisitTypesParams): Promise<VisitType[]> {
    const { token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/types`;
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
        throw new Error(errorData.message || `Error obteniendo tipos de visita: ${response.statusText}`);
      }

      const result = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return result.data.map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        description: t.description,
        requiresAuthorization: t.requires_authorization,
        requiresVehicleRegistration: t.requires_vehicle_registration,
        requiresCompanions: t.requires_companions,
        requiresAssetsTracking: t.requires_assets_tracking,
        maxDurationHours: t.max_duration_hours,
        defaultDurationMinutes: t.default_duration_minutes,
        isActive: t.is_active,
      }));
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

  async getVisitStatuses(params: GetVisitStatusesParams): Promise<VisitStatus[]> {
    const { token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/statuses`;
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
        throw new Error(errorData.message || `Error obteniendo estados de visita: ${response.statusText}`);
      }

      const result = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return result.data.map((s: any) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        description: s.description,
        isFinal: s.is_final,
        isActive: s.is_active,
      }));
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

  async getCompanions(params: GetCompanionsParams): Promise<VisitCompanion[]> {
    const { businessId, visitId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/companions`;
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
        throw new Error(errorData.message || `Error obteniendo acompañantes: ${response.statusText}`);
      }

      const result = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      return result.data.map((c: any) => ({
        id: c.id,
        visitId: c.visit_id,
        visitorId: c.visitor_id,
        companionName: c.companion_name,
        companionDni: c.companion_dni,
        companionPhone: c.companion_phone,
        isMinor: c.is_minor,
        relationship: c.relationship,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
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

  async createCompanion(params: CreateCompanionParams): Promise<VisitCompanion> {
    const { businessId, visitId, data, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/companions`;
    const method = 'POST';
    const startTime = Date.now();

    const backendData = {
      companion_name: data.companionName,
      companion_dni: data.companionDni,
      companion_phone: data.companionPhone,
      is_minor: data.isMinor,
      relationship: data.relationship,
      notes: data.notes,
    };

    logHttpRequest({ method, url, body: backendData });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
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
        throw new Error(errorData.message || `Error creando acompañante: ${response.statusText}`);
      }

      const result = await response.json();
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data: result });

      const c = result.data;
      return {
        id: c.id,
        visitId: c.visit_id,
        visitorId: c.visitor_id,
        companionName: c.companion_name,
        companionDni: c.companion_dni,
        companionPhone: c.companion_phone,
        isMinor: c.is_minor,
        relationship: c.relationship,
        notes: c.notes,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
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

  async deleteCompanion(params: DeleteCompanionParams): Promise<void> {
    const { businessId, visitId, companionId, token } = params;

    const url = `${this.baseUrl}/horizontal-properties/visits/${visitId}/companions/${companionId}`;
    const method = 'DELETE';
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
        throw new Error(errorData.message || `Error eliminando acompañante: ${response.statusText}`);
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
}
