/**
 * Implementación del repositorio de Grupos de Votación
 */

import { 
  IVotingGroupsRepository, 
  GetVotingGroupsParams,
  CreateVotingGroupParams,
  UpdateVotingGroupParams,
  DeleteVotingGroupParams 
} from '../../domain/ports';
import { VotingGroup, VotingGroupsList } from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendGetVotingGroupsResponse, BackendCreateVotingGroupResponse, BackendUpdateVotingGroupResponse, BackendDeleteVotingGroupResponse } from './response';

export class VotingGroupsRepository implements IVotingGroupsRepository {
  async getVotingGroups(params: GetVotingGroupsParams): Promise<VotingGroupsList> {
    const { token, businessId } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/${businessId}/voting-groups`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendGetVotingGroupsResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo grupos de votación: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.length} grupos de votación obtenidos`,
        data: backendResponse,
      });

      const votingGroups: VotingGroup[] = backendResponse.data.map(vg => ({
        id: vg.id,
        businessId: vg.business_id,
        name: vg.name,
        description: vg.description,
        votingStartDate: vg.voting_start_date,
        votingEndDate: vg.voting_end_date,
        isActive: vg.is_active,
        requiresQuorum: vg.requires_quorum,
        quorumPercentage: vg.quorum_percentage,
        createdByUserId: vg.created_by_user_id,
        notes: vg.notes,
        createdAt: vg.created_at,
        updatedAt: vg.updated_at,
      }));

      return { votingGroups };
    } catch (error) {
      console.error('Error obteniendo grupos de votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener grupos de votación del servidor'
      );
    }
  }

  async createVotingGroup(params: CreateVotingGroupParams): Promise<VotingGroup> {
    const { token, businessId, data } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/${businessId}/voting-groups`;
    const startTime = Date.now();

    // Solo incluir campos que no sean undefined
    const requestBody: Record<string, unknown> = {
      name: data.name,
      voting_start_date: data.votingStartDate,
      voting_end_date: data.votingEndDate,
    };

    // Campos opcionales
    if (data.description !== undefined) requestBody.description = data.description;
    if (data.requiresQuorum !== undefined) requestBody.requires_quorum = data.requiresQuorum;
    if (data.quorumPercentage !== undefined) requestBody.quorum_percentage = data.quorumPercentage;
    if (data.createdByUserId !== undefined) requestBody.created_by_user_id = data.createdByUserId;
    if (data.notes !== undefined) requestBody.notes = data.notes;

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: requestBody,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendCreateVotingGroupResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || backendResponse.message || `Error creando grupo de votación: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Grupo de votación "${backendResponse.data.name}" creado con ID ${backendResponse.data.id}`,
        data: backendResponse,
      });

      const votingGroup: VotingGroup = {
        id: backendResponse.data.id,
        businessId: backendResponse.data.business_id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        votingStartDate: backendResponse.data.voting_start_date,
        votingEndDate: backendResponse.data.voting_end_date,
        isActive: backendResponse.data.is_active,
        requiresQuorum: backendResponse.data.requires_quorum,
        quorumPercentage: backendResponse.data.quorum_percentage,
        createdByUserId: backendResponse.data.created_by_user_id,
        notes: backendResponse.data.notes,
        createdAt: backendResponse.data.created_at,
        updatedAt: backendResponse.data.updated_at,
      };

      return votingGroup;
    } catch (error) {
      console.error('Error creando grupo de votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear grupo de votación en el servidor'
      );
    }
  }

  async updateVotingGroup(params: UpdateVotingGroupParams): Promise<VotingGroup> {
    const { token, hpId, groupId, data } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/${hpId}/voting-groups/${groupId}`;
    const startTime = Date.now();

    // Solo incluir campos que no sean undefined
    const requestBody: Record<string, unknown> = {};
    
    if (data.name !== undefined) requestBody.name = data.name;
    if (data.description !== undefined) requestBody.description = data.description;
    if (data.votingStartDate !== undefined) requestBody.voting_start_date = data.votingStartDate;
    if (data.votingEndDate !== undefined) requestBody.voting_end_date = data.votingEndDate;
    if (data.requiresQuorum !== undefined) requestBody.requires_quorum = data.requiresQuorum;
    if (data.quorumPercentage !== undefined) requestBody.quorum_percentage = data.quorumPercentage;
    if (data.createdByUserId !== undefined) requestBody.created_by_user_id = data.createdByUserId;
    if (data.notes !== undefined) requestBody.notes = data.notes;

    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body: requestBody,
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendUpdateVotingGroupResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al actualizar grupo de votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Grupo actualizado: ${backendResponse.data.name}`,
        data: backendResponse,
      });

      // Mapear la respuesta del backend al dominio
      const votingGroup: VotingGroup = {
        id: backendResponse.data.id,
        businessId: backendResponse.data.business_id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        votingStartDate: backendResponse.data.voting_start_date,
        votingEndDate: backendResponse.data.voting_end_date,
        isActive: backendResponse.data.is_active,
        requiresQuorum: backendResponse.data.requires_quorum,
        quorumPercentage: backendResponse.data.quorum_percentage,
        createdByUserId: backendResponse.data.created_by_user_id,
        notes: backendResponse.data.notes,
        createdAt: backendResponse.data.created_at,
        updatedAt: backendResponse.data.updated_at,
      };

      return votingGroup;
    } catch (error) {
      console.error('Error actualizando grupo de votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar grupo de votación en el servidor'
      );
    }
  }

  async deleteVotingGroup(params: DeleteVotingGroupParams): Promise<string> {
    const { token, hpId, groupId } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/${hpId}/voting-groups/${groupId}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'DELETE',
      url,
      token,
      body: null, // No body required for DELETE
    });

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendDeleteVotingGroupResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al eliminar grupo de votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Grupo eliminado: ID ${groupId}`,
        data: backendResponse,
      });

      return backendResponse.message || 'Grupo desactivado';
    } catch (error) {
      console.error('Error eliminando grupo de votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar grupo de votación en el servidor'
      );
    }
  }
}

