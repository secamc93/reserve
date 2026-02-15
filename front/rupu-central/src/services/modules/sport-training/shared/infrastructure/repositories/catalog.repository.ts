/**
 * Catalog Repository - Sport Training
 * Repositorio para obtener catálogos maestros (skill levels, session types, etc.)
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  SkillLevel,
  SessionType,
  BookingStatus,
  AttendanceStatus,
  CoachSpecialty,
} from '../../domain/entities';
import {
  BackendSkillLevelsResponse,
  BackendSkillLevel,
  BackendSessionTypesResponse,
  BackendSessionType,
  BackendBookingStatusesResponse,
  BackendBookingStatus,
  BackendAttendanceStatusesResponse,
  BackendAttendanceStatus,
  BackendCoachSpecialtiesResponse,
  BackendCoachSpecialty,
} from './response/catalog.response';

export class CatalogRepository {
  private baseUrl = env.API_BASE_URL;

  // ==================== MAPPERS ====================

  private mapBackendSkillLevel(item: BackendSkillLevel): SkillLevel {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      sortOrder: item.sort_order,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapBackendSessionType(item: BackendSessionType): SessionType {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      isGroup: item.is_group,
      maxParticipants: item.max_participants,
      defaultDurationMinutes: item.default_duration_minutes,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapBackendBookingStatus(item: BackendBookingStatus): BookingStatus {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapBackendAttendanceStatus(item: BackendAttendanceStatus): AttendanceStatus {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapBackendCoachSpecialty(item: BackendCoachSpecialty): CoachSpecialty {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  // ==================== MÉTODOS ====================

  async getSkillLevels(token: string): Promise<SkillLevel[]> {
    const url = `${this.baseUrl}/sport-training/skill-levels`;
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
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data: BackendSkillLevelsResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener skill levels');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendSkillLevel.bind(this));
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

  async getSessionTypes(token: string): Promise<SessionType[]> {
    const url = `${this.baseUrl}/sport-training/session-types`;
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
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data: BackendSessionTypesResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener session types');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendSessionType.bind(this));
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

  async getBookingStatuses(token: string): Promise<BookingStatus[]> {
    const url = `${this.baseUrl}/sport-training/booking-statuses`;
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
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data: BackendBookingStatusesResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener booking statuses');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendBookingStatus.bind(this));
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

  async getAttendanceStatuses(token: string): Promise<AttendanceStatus[]> {
    const url = `${this.baseUrl}/sport-training/attendance-statuses`;
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
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data: BackendAttendanceStatusesResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener attendance statuses');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendAttendanceStatus.bind(this));
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

  async getCoachSpecialties(token: string): Promise<CoachSpecialty[]> {
    const url = `${this.baseUrl}/sport-training/coach-specialties`;
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
        cache: 'no-store',
      });

      const duration = Date.now() - startTime;
      const data: BackendCoachSpecialtiesResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener coach specialties');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendCoachSpecialty.bind(this));
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
