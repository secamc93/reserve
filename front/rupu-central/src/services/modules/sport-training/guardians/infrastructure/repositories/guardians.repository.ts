/**
 * Guardians Repository Implementation
 * Implementacion del repositorio de tutores
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IGuardiansRepository,
  GetGuardiansParams,
  GetGuardianByIdParams,
  CreateGuardianParams,
  UpdateGuardianParams,
  GuardiansPaginated,
  Guardian,
} from '../../domain';
import {
  BackendGetGuardiansResponse,
  BackendGetGuardianByIdResponse,
  BackendCreateGuardianResponse,
  BackendUpdateGuardianResponse,
  BackendGuardian,
  BackendGuardianListItem,
} from './response/guardians.response';

export class GuardiansRepository implements IGuardiansRepository {
  private baseUrl = env.API_BASE_URL;

  // ==================== MAPPERS ====================

  private mapBackendGuardianListItem(g: BackendGuardianListItem): Guardian {
    return {
      id: g.id,
      businessId: g.business_id,
      firstName: g.first_name,
      lastName: g.last_name,
      documentType: g.document_type,
      documentNumber: g.document_number,
      email: g.email,
      phone: g.phone,
      relationship: g.relationship,
      canBookSessions: g.can_book_sessions,
      canAccessRecords: g.can_access_records,
      isActive: g.is_active,
      createdAt: g.created_at,
      updatedAt: '',
    };
  }

  private mapBackendGuardian(g: BackendGuardian): Guardian {
    return {
      id: g.id,
      businessId: g.business_id,
      firstName: g.first_name,
      lastName: g.last_name,
      documentType: g.document_type,
      documentNumber: g.document_number,
      email: g.email,
      phone: g.phone,
      secondaryPhone: g.secondary_phone,
      address: g.address,
      city: g.city,
      state: g.state,
      country: g.country,
      relationship: g.relationship,
      photoUrl: g.photo_url,
      notes: g.notes,
      canBookSessions: g.can_book_sessions,
      canAccessRecords: g.can_access_records,
      isActive: g.is_active,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    };
  }

  // ==================== METODOS ====================

  async getGuardians(params: GetGuardiansParams): Promise<GuardiansPaginated> {
    const { businessId, token, page = 1, pageSize = 10, name, isActive } = params;

    const queryParams = new URLSearchParams({
      business_id: businessId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name !== undefined) queryParams.append('name', name);
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());

    const url = `${this.baseUrl}/sport-training/guardians?${queryParams.toString()}`;
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
      const data: BackendGetGuardiansResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al obtener los tutores');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        data: data.data.map(this.mapBackendGuardianListItem.bind(this)),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async getGuardianById(params: GetGuardianByIdParams): Promise<Guardian> {
    const { businessId, guardianId, token } = params;
    const url = `${this.baseUrl}/sport-training/guardians/${guardianId}?business_id=${businessId}`;
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
      const data: BackendGetGuardianByIdResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al obtener el tutor');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
      return this.mapBackendGuardian(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async createGuardian(params: CreateGuardianParams): Promise<Guardian> {
    const { token, data: dto } = params;
    const url = `${this.baseUrl}/sport-training/guardians`;
    const method = 'POST';
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      business_id: dto.businessId,
      first_name: dto.firstName,
      last_name: dto.lastName,
      document_type: dto.documentType,
      document_number: dto.documentNumber,
      email: dto.email,
      phone: dto.phone,
    };

    if (dto.secondaryPhone !== undefined) body.secondary_phone = dto.secondaryPhone;
    if (dto.address !== undefined) body.address = dto.address;
    if (dto.city !== undefined) body.city = dto.city;
    if (dto.state !== undefined) body.state = dto.state;
    if (dto.country !== undefined) body.country = dto.country;
    if (dto.relationship !== undefined) body.relationship = dto.relationship;
    if (dto.canBookSessions !== undefined) body.can_book_sessions = dto.canBookSessions;
    if (dto.canAccessRecords !== undefined) body.can_access_records = dto.canAccessRecords;

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
      const data: BackendCreateGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al crear el tutor');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
      return this.mapBackendGuardian(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async updateGuardian(params: UpdateGuardianParams): Promise<Guardian> {
    const { businessId, guardianId, token, data: dto } = params;
    const url = `${this.baseUrl}/sport-training/guardians/${guardianId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = { business_id: businessId };

    if (dto.firstName !== undefined) body.first_name = dto.firstName;
    if (dto.lastName !== undefined) body.last_name = dto.lastName;
    if (dto.documentType !== undefined) body.document_type = dto.documentType;
    if (dto.documentNumber !== undefined) body.document_number = dto.documentNumber;
    if (dto.email !== undefined) body.email = dto.email;
    if (dto.phone !== undefined) body.phone = dto.phone;
    if (dto.secondaryPhone !== undefined) body.secondary_phone = dto.secondaryPhone;
    if (dto.address !== undefined) body.address = dto.address;
    if (dto.city !== undefined) body.city = dto.city;
    if (dto.state !== undefined) body.state = dto.state;
    if (dto.country !== undefined) body.country = dto.country;
    if (dto.relationship !== undefined) body.relationship = dto.relationship;
    if (dto.canBookSessions !== undefined) body.can_book_sessions = dto.canBookSessions;
    if (dto.canAccessRecords !== undefined) body.can_access_records = dto.canAccessRecords;
    if (dto.isActive !== undefined) body.is_active = dto.isActive;

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
      const data: BackendUpdateGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al actualizar el tutor');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
      return this.mapBackendGuardian(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }
}
