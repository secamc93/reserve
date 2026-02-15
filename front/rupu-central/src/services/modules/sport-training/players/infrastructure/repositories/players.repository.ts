/**
 * Players Repository Implementation
 * Implementación del repositorio de jugadores
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IPlayersRepository,
  GetPlayersParams,
  GetPlayerByIdParams,
  CreatePlayerParams,
  UpdatePlayerParams,
  DeletePlayerParams,
  PlayersPaginated,
  Player,
} from '../../domain';
import {
  BackendGetPlayersResponse,
  BackendGetPlayerByIdResponse,
  BackendCreatePlayerResponse,
  BackendUpdatePlayerResponse,
  BackendDeletePlayerResponse,
  BackendPlayer,
  BackendPlayerListItem,
} from './response/players.response';

export class PlayersRepository implements IPlayersRepository {
  private baseUrl = env.API_BASE_URL;

  // ==================== MAPPERS ====================

  private mapBackendPlayerListItem(player: BackendPlayerListItem): Player {
    return {
      id: player.id,
      businessId: player.business_id,
      firstName: player.first_name,
      lastName: player.last_name,
      documentNumber: player.document_number,
      birthDate: player.birth_date,
      skillLevelId: player.skill_level_id,
      skillLevelName: player.skill_level_name,
      email: player.email,
      phone: player.phone,
      emergencyContact: undefined,
      medicalNotes: undefined,
      isActive: player.is_active,
      createdAt: player.created_at,
      updatedAt: '', // No viene en listado
    };
  }

  private mapBackendPlayer(player: BackendPlayer): Player {
    return {
      id: player.id,
      businessId: player.business_id,
      firstName: player.first_name,
      lastName: player.last_name,
      documentNumber: player.document_number,
      birthDate: player.birth_date,
      skillLevelId: player.skill_level_id,
      skillLevelName: player.skill_level_name,
      email: player.email,
      phone: player.phone,
      emergencyContact: player.emergency_contact,
      medicalNotes: player.medical_notes,
      isActive: player.is_active,
      createdAt: player.created_at,
      updatedAt: player.updated_at,
    };
  }

  // ==================== MÉTODOS ====================

  async getPlayers(params: GetPlayersParams): Promise<PlayersPaginated> {
    const { businessId, token, page = 1, pageSize = 10, name, documentNumber, skillLevelId, isActive } = params;

    const queryParams = new URLSearchParams({
      business_id: businessId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (name !== undefined) queryParams.append('name', name);
    if (documentNumber !== undefined) queryParams.append('document_number', documentNumber);
    if (skillLevelId !== undefined) queryParams.append('skill_level_id', skillLevelId.toString());
    if (isActive !== undefined) queryParams.append('is_active', isActive.toString());

    const url = `${this.baseUrl}/sport-training/players?${queryParams.toString()}`;
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
      const data: BackendGetPlayersResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener los jugadores');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return {
        data: data.data.map(this.mapBackendPlayerListItem.bind(this)),
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

  async getPlayerById(params: GetPlayerByIdParams): Promise<Player> {
    const { businessId, playerId, token } = params;
    const url = `${this.baseUrl}/sport-training/players/${playerId}?business_id=${businessId}`;
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
      const data: BackendGetPlayerByIdResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al obtener el jugador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPlayer(data.data);
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

  async createPlayer(params: CreatePlayerParams): Promise<Player> {
    const { token, data: playerData } = params;
    const url = `${this.baseUrl}/sport-training/players`;
    const method = 'POST';
    const startTime = Date.now();

    const body = {
      business_id: playerData.businessId,
      first_name: playerData.firstName,
      last_name: playerData.lastName,
      document_number: playerData.documentNumber,
      birth_date: playerData.birthDate,
      skill_level_id: playerData.skillLevelId,
      email: playerData.email,
      phone: playerData.phone,
      emergency_contact: playerData.emergencyContact,
      medical_notes: playerData.medicalNotes,
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
      const data: BackendCreatePlayerResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al crear el jugador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPlayer(data.data);
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

  async updatePlayer(params: UpdatePlayerParams): Promise<Player> {
    const { businessId, playerId, token, data: playerData } = params;
    const url = `${this.baseUrl}/sport-training/players/${playerId}`;
    const method = 'PUT';
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      business_id: businessId,
    };

    if (playerData.firstName !== undefined) body.first_name = playerData.firstName;
    if (playerData.lastName !== undefined) body.last_name = playerData.lastName;
    if (playerData.documentNumber !== undefined) body.document_number = playerData.documentNumber;
    if (playerData.birthDate !== undefined) body.birth_date = playerData.birthDate;
    if (playerData.skillLevelId !== undefined) body.skill_level_id = playerData.skillLevelId;
    if (playerData.email !== undefined) body.email = playerData.email;
    if (playerData.phone !== undefined) body.phone = playerData.phone;
    if (playerData.emergencyContact !== undefined) body.emergency_contact = playerData.emergencyContact;
    if (playerData.medicalNotes !== undefined) body.medical_notes = playerData.medicalNotes;
    if (playerData.isActive !== undefined) body.is_active = playerData.isActive;

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
      const data: BackendUpdatePlayerResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al actualizar el jugador');
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });

      return this.mapBackendPlayer(data.data);
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

  async deletePlayer(params: DeletePlayerParams): Promise<void> {
    const { businessId, playerId, token } = params;
    const url = `${this.baseUrl}/sport-training/players/${playerId}?business_id=${businessId}`;
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
      const data: BackendDeletePlayerResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.message || 'Error al eliminar el jugador');
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
