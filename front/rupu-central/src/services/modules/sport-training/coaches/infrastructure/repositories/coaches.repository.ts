/**
 * Coaches Repository Implementation
 * Implementación del repositorio de entrenadores
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  ICoachesRepository,
  GetCoachesParams,
  GetCoachByIdParams,
  CreateCoachParams,
  UpdateCoachParams,
  DeleteCoachParams,
  AssignCoachSpecialtyParams,
  CoachesPaginated,
  Coach,
  CoachSpecialtyAssignment,
} from '../../domain';
import {
  BackendGetCoachesResponse,
  BackendGetCoachByIdResponse,
  BackendCreateCoachResponse,
  BackendUpdateCoachResponse,
  BackendDeleteCoachResponse,
  BackendAssignSpecialtyResponse,
  BackendCoach,
  BackendCoachListItem,
  BackendCoachSpecialtyAssignment,
} from './response/coaches.response';

export class CoachesRepository implements ICoachesRepository {
  private baseUrl = env.API_BASE_URL;

  // ==================== MAPPERS ====================

  private mapBackendCoachSpecialty(specialty: BackendCoachSpecialtyAssignment): CoachSpecialtyAssignment {
    return {
      id: specialty.id,
      coachId: specialty.coach_id,
      specialtyId: specialty.specialty_id,
      specialtyName: specialty.specialty_name,
      specialtyCode: specialty.specialty_code,
      yearsExperience: specialty.years_experience,
      createdAt: specialty.created_at,
    };
  }

  private mapBackendCoachListItem(coach: BackendCoachListItem): Coach {
    return {
      id: coach.id,
      businessId: coach.business_id,
      firstName: coach.first_name,
      lastName: coach.last_name,
      documentNumber: coach.document_number,
      email: coach.email,
      phone: coach.phone,
      specialties: coach.specialties.map(this.mapBackendCoachSpecialty.bind(this)),
      isActive: coach.is_active,
      createdAt: coach.created_at,
      updatedAt: '', // No viene en listado
    };
  }

  private mapBackendCoach(coach: BackendCoach): Coach {
    return {
      id: coach.id,
      businessId: coach.business_id,
      firstName: coach.first_name,
      lastName: coach.last_name,
      documentNumber: coach.document_number,
      email: coach.email,
      phone: coach.phone,
      specialties: coach.specialties.map(this.mapBackendCoachSpecialty.bind(this)),
      isActive: coach.is_active,
      createdAt: coach.created_at,
      updatedAt: coach.updated_at,
    };
  }

  // ==================== MÉTODOS ====================

  async getCoaches(params: GetCoachesParams): Promise<CoachesPaginated> {
    const { businessId, token, page = 1, pageSize = 10, name, specialtyId, isActive } = params;

    const queryParams = new URLSearchParams({
      business_id: businessId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name !== undefined) queryParams.append('name', name);
    if (specialtyId !== undefined) queryParams.append('specialty_id', specialtyId.toString());
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());

    const url = `${this.baseUrl}/sport-training/coaches?${queryParams.toString()}`;
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
      const data: BackendGetCoachesResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener los entrenadores');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        data: data.data.map(this.mapBackendCoachListItem.bind(this)),
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

  async getCoachById(params: GetCoachByIdParams): Promise<Coach> {
    const { businessId, coachId, token } = params;
    const url = `${this.baseUrl}/sport-training/coaches/${coachId}?business_id=${businessId}`;
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
      const data: BackendGetCoachByIdResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener el entrenador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendCoach(data.data);
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

  async createCoach(params: CreateCoachParams): Promise<Coach> {
    const { token, data: coachData } = params;
    const url = `${this.baseUrl}/sport-training/coaches`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      business_id: coachData.businessId,
      first_name: coachData.firstName,
      last_name: coachData.lastName,
      document_number: coachData.documentNumber,
      email: coachData.email,
      phone: coachData.phone,
    };

    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendCreateCoachResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al crear el entrenador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendCoach(data.data);
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

  async updateCoach(params: UpdateCoachParams): Promise<Coach> {
    const { businessId, coachId, token, data: coachData } = params;
    const url = `${this.baseUrl}/sport-training/coaches/${coachId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      business_id: businessId,
    };

    if (coachData.firstName !== undefined) body.first_name = coachData.firstName;
    if (coachData.lastName !== undefined) body.last_name = coachData.lastName;
    if (coachData.documentNumber !== undefined) body.document_number = coachData.documentNumber;
    if (coachData.email !== undefined) body.email = coachData.email;
    if (coachData.phone !== undefined) body.phone = coachData.phone;
    if (coachData.isActive !== undefined) body.is_active = coachData.isActive;

    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendUpdateCoachResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al actualizar el entrenador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendCoach(data.data);
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

  async deleteCoach(params: DeleteCoachParams): Promise<void> {
    const { businessId, coachId, token } = params;
    const url = `${this.baseUrl}/sport-training/coaches/${coachId}?business_id=${businessId}`;
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
      const data: BackendDeleteCoachResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al eliminar el entrenador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
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

  async assignSpecialty(params: AssignCoachSpecialtyParams): Promise<void> {
    const { token, data: specialtyData } = params;
    const url = `${this.baseUrl}/sport-training/coaches/${specialtyData.coachId}/specialties`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      specialty_id: specialtyData.specialtyId,
      years_experience: specialtyData.yearsExperience,
    };

    logHttpRequest({ method, url, body });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendAssignSpecialtyResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al asignar especialidad');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
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
