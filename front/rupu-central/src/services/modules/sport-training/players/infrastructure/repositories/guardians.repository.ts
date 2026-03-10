/**
 * Guardians Repository Implementation
 * Implementación del repositorio de apoderados
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IGuardiansRepository,
  GetGuardiansParams,
  GetGuardianByIdParams,
  CreateGuardianParams,
  UpdateGuardianParams,
  DeleteGuardianParams,
  AssignGuardianParams,
  GetPlayerGuardiansParams,
  RemoveGuardianFromPlayerParams,
  GuardiansPaginated,
  Guardian,
  PlayerGuardian,
} from '../../domain';
import {
  BackendGetGuardiansResponse,
  BackendGetGuardianByIdResponse,
  BackendCreateGuardianResponse,
  BackendUpdateGuardianResponse,
  BackendDeleteGuardianResponse,
  BackendAssignGuardianResponse,
  BackendGetPlayerGuardiansResponse,
  BackendGuardian,
  BackendGuardianListItem,
  BackendPlayerGuardian,
} from './response/guardians.response';

export class GuardiansRepository implements IGuardiansRepository {
  private baseUrl = env.API_BASE_URL;

  // ==================== MAPPERS ====================

  private mapBackendGuardianListItem(guardian: BackendGuardianListItem): Guardian {
    return {
      id: guardian.id,
      businessId: guardian.business_id,
      firstName: guardian.first_name,
      lastName: guardian.last_name,
      documentNumber: guardian.document_number,
      email: guardian.email,
      phone: guardian.phone,
      relationshipType: guardian.relationship_type,
      isActive: guardian.is_active,
      createdAt: guardian.created_at,
      updatedAt: '',
    };
  }

  private mapBackendGuardian(guardian: BackendGuardian): Guardian {
    return {
      id: guardian.id,
      businessId: guardian.business_id,
      firstName: guardian.first_name,
      lastName: guardian.last_name,
      documentNumber: guardian.document_number,
      email: guardian.email,
      phone: guardian.phone,
      relationshipType: guardian.relationship_type,
      isActive: guardian.is_active,
      createdAt: guardian.created_at,
      updatedAt: guardian.updated_at,
    };
  }

  private mapBackendPlayerGuardian(pg: BackendPlayerGuardian): PlayerGuardian {
    return {
      id: pg.id,
      playerId: pg.player_id,
      guardianId: pg.guardian_id,
      guardianName: pg.guardian_name,
      guardianPhone: pg.guardian_phone,
      isPrimary: pg.is_primary,
      createdAt: pg.created_at,
    };
  }

  // ==================== MÉTODOS ====================

  async getGuardians(params: GetGuardiansParams): Promise<GuardiansPaginated> {
    const { businessId, token, page = 1, pageSize = 10, name, documentNumber, isActive } = params;

    const queryParams = new URLSearchParams({
      business_id: businessId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name !== undefined) queryParams.append('name', name);
    if (documentNumber !== undefined) queryParams.append('document_number', documentNumber);
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
        throw new Error(data.message || 'Error al obtener los apoderados');
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
        throw new Error(data.message || 'Error al obtener el apoderado');
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
    const { token, data: guardianData } = params;
    const url = `${this.baseUrl}/sport-training/guardians`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      business_id: guardianData.businessId,
      first_name: guardianData.firstName,
      last_name: guardianData.lastName,
      document_number: guardianData.documentNumber,
      email: guardianData.email,
      phone: guardianData.phone,
      relationship_type: guardianData.relationshipType,
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
      const data: BackendCreateGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al crear el apoderado');
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
    const { businessId, guardianId, token, data: guardianData } = params;
    const url = `${this.baseUrl}/sport-training/guardians/${guardianId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      business_id: businessId,
    };

    if (guardianData.firstName !== undefined) body.first_name = guardianData.firstName;
    if (guardianData.lastName !== undefined) body.last_name = guardianData.lastName;
    if (guardianData.documentNumber !== undefined) body.document_number = guardianData.documentNumber;
    if (guardianData.email !== undefined) body.email = guardianData.email;
    if (guardianData.phone !== undefined) body.phone = guardianData.phone;
    if (guardianData.relationshipType !== undefined) body.relationship_type = guardianData.relationshipType;
    if (guardianData.isActive !== undefined) body.is_active = guardianData.isActive;

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
        throw new Error(data.message || 'Error al actualizar el apoderado');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendGuardian(data.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async deleteGuardian(params: DeleteGuardianParams): Promise<void> {
    const { businessId, guardianId, token } = params;
    const url = `${this.baseUrl}/sport-training/guardians/${guardianId}?business_id=${businessId}`;
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
      const data: BackendDeleteGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al eliminar el apoderado');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async assignGuardian(params: AssignGuardianParams): Promise<void> {
    const { token, data: assignData } = params;
    const url = `${this.baseUrl}/sport-training/players/${assignData.playerId}/guardians`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      guardian_id: assignData.guardianId,
      is_primary: assignData.isPrimary,
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
      const data: BackendAssignGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al asignar apoderado');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async getPlayerGuardians(params: GetPlayerGuardiansParams): Promise<PlayerGuardian[]> {
    const { businessId, playerId, token } = params;
    const url = `${this.baseUrl}/sport-training/players/${playerId}/guardians?business_id=${businessId}`;
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
      const data: BackendGetPlayerGuardiansResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al obtener apoderados del jugador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return data.data.map(this.mapBackendPlayerGuardian.bind(this));
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }

  async removeGuardianFromPlayer(params: RemoveGuardianFromPlayerParams): Promise<void> {
    const { businessId, playerId, guardianId, token } = params;
    const url = `${this.baseUrl}/sport-training/players/${playerId}/guardians/${guardianId}?business_id=${businessId}`;
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
      const data: BackendDeleteGuardianResponse = await response.json();

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.message || 'Error al remover apoderado del jugador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: String(error) } });
      throw error;
    }
  }
}
