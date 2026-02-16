/**
 * Implementación del repositorio de Votaciones
 */

import {
  IVotingsRepository,
  IVotingOptionsRepository,
  IVotesRepository,
  GetVotingsParams,
  GetVotingByIdParams,
  CreateVotingParams,
  UpdateVotingParams,
  DeleteVotingParams,
  ActivateVotingParams,
  DeactivateVotingParams,
  GetVotingOptionsParams,
  CreateVotingOptionParams,
  GetVotingOptionByIdParams,
  UpdateVotingOptionStatusParams,
  DeleteVotingOptionParams,
  GetVotesParams,
  CreateVoteParams,
  CreateBulkVotesParams,
  MarkUnitAttendanceParams,
} from '../../domain/ports';
import { Voting, VotingsList, VotingOption, VotingOptionsList, Vote, VotesList, BulkVoteResult } from '../../domain';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  BackendGetVotingsResponse,
  BackendGetVotingByIdResponse,
  BackendCreateVotingResponse,
  BackendUpdateVotingResponse,
  BackendDeleteVotingResponse,
  BackendActivateVotingResponse,
  BackendDeactivateVotingResponse,
  BackendGetVotingOptionsResponse,
  BackendCreateVotingOptionResponse,
  BackendVotingOptionResponse,
  BackendDeleteVotingOptionResponse,
  BackendGetVotesResponse,
  BackendCreateVoteResponse,
  BackendCreateBulkVotesResponse,
} from './response/votings.response';

// ============================================
// VOTINGS REPOSITORY
// ============================================

export class VotingsRepository implements IVotingsRepository {
  async getVotings(params: GetVotingsParams): Promise<VotingsList> {
    // URL correcta: mantener groupId en path; business_id por query param
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
    });

    const duration = Date.now() - startTime;
    const data: BackendGetVotingsResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(`Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `${data.data.length} votaciones obtenidas`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    const votings: Voting[] = data.data.map(voting => ({
      id: voting.id,
      votingGroupId: voting.voting_group_id,
      title: voting.title,
      description: voting.description,
      votingType: voting.voting_type,
      isSecret: voting.is_secret,
      allowAbstention: voting.allow_abstention,
      isActive: voting.is_active,
      displayOrder: voting.display_order,
      requiredPercentage: voting.required_percentage,
      createdAt: voting.created_at,
      updatedAt: voting.updated_at,
    }));

    return {
      votings,
      total: votings.length,
    };
  }

  async getVotingById(params: GetVotingByIdParams): Promise<Voting> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        // Si el endpoint no existe (404), intentar obtener la votación desde la lista
        if (response.status === 404) {
          console.log(`⚠️ Endpoint específico no encontrado, obteniendo desde lista de votaciones...`);
          return await this.getVotingFromList(params);
        }

        const errorData = await response.json();
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(`Error ${response.status}: Votación no encontrada`);
      }

      const data: BackendGetVotingByIdResponse = await response.json();

      if (!data.success || !data.data) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error('Votación no encontrada');
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación obtenida: ${data.data.title}`,
        data,
      });

      // Mapear la respuesta del backend al dominio
      const voting = data.data;
      return {
        id: voting.id,
        votingGroupId: voting.voting_group_id,
        title: voting.title,
        description: voting.description,
        votingType: voting.voting_type,
        isSecret: voting.is_secret,
        allowAbstention: voting.allow_abstention,
        isActive: voting.is_active,
        displayOrder: voting.display_order,
        requiredPercentage: voting.required_percentage,
        createdAt: voting.created_at,
        updatedAt: voting.updated_at,
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

  private async getVotingFromList(params: GetVotingByIdParams): Promise<Voting> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendGetVotingsResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(`Error ${response.status}: No se pudieron obtener las votaciones`);
      }

      // Buscar la votación específica por ID
      const voting = data.data.find(v => v.id === params.votingId);

      if (!voting) {
        logHttpError({
          status: 404,
          statusText: 'Not Found',
          duration,
          data: { message: `Votación con ID ${params.votingId} no encontrada en la lista` },
        });
        throw new Error(`Votación con ID ${params.votingId} no encontrada`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación obtenida desde lista: ${voting.title}`,
        data,
      });

      return {
        id: voting.id,
        votingGroupId: voting.voting_group_id,
        title: voting.title,
        description: voting.description,
        votingType: voting.voting_type,
        isSecret: voting.is_secret,
        allowAbstention: voting.allow_abstention,
        isActive: voting.is_active,
        displayOrder: voting.display_order,
        requiredPercentage: voting.required_percentage,
        createdAt: voting.created_at,
        updatedAt: voting.updated_at,
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

  async createVoting(params: CreateVotingParams): Promise<Voting> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    const body = {
      title: params.data.title,
      description: params.data.description,
      voting_type: params.data.votingType,
      is_secret: params.data.isSecret,
      allow_abstention: params.data.allowAbstention,
      display_order: params.data.displayOrder,
      required_percentage: params.data.requiredPercentage,
    };

    logHttpRequest({ method: 'POST', url, body });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const data: BackendCreateVotingResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(`Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Votación creada: ${data.data.title}`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    return {
      id: data.data.id,
      votingGroupId: data.data.voting_group_id,
      title: data.data.title,
      description: data.data.description,
      votingType: data.data.voting_type,
      isSecret: data.data.is_secret,
      allowAbstention: data.data.allow_abstention,
      isActive: data.data.is_active,
      displayOrder: data.data.display_order,
      requiredPercentage: data.data.required_percentage,
      createdAt: data.data.created_at,
      updatedAt: data.data.updated_at,
    };
  }

  async updateVoting(params: UpdateVotingParams): Promise<Voting> {
    const { token, businessId, groupId, votingId, data } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}${businessId !== undefined ? `?business_id=${businessId}` : ''
      }`;
    const startTime = Date.now();

    const requestBody: Record<string, unknown> = {};

    if (data.title !== undefined) requestBody.title = data.title;
    if (data.description !== undefined) requestBody.description = data.description;
    if (data.votingType !== undefined) requestBody.voting_type = data.votingType;
    if (data.isSecret !== undefined) requestBody.is_secret = data.isSecret;
    if (data.allowAbstention !== undefined) requestBody.allow_abstention = data.allowAbstention;
    if (data.displayOrder !== undefined) requestBody.display_order = data.displayOrder;
    if (data.requiredPercentage !== undefined) requestBody.required_percentage = data.requiredPercentage;

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
      const backendResponse: BackendUpdateVotingResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al actualizar votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación actualizada: ${backendResponse.data.title}`,
        data: backendResponse,
      });

      const voting: Voting = {
        id: backendResponse.data.id,
        votingGroupId: backendResponse.data.voting_group_id,
        title: backendResponse.data.title,
        description: backendResponse.data.description,
        votingType: backendResponse.data.voting_type,
        isSecret: backendResponse.data.is_secret,
        allowAbstention: backendResponse.data.allow_abstention,
        isActive: backendResponse.data.is_active,
        displayOrder: backendResponse.data.display_order,
        requiredPercentage: backendResponse.data.required_percentage,
        createdAt: backendResponse.data.created_at,
        updatedAt: backendResponse.data.updated_at,
      };

      return voting;
    } catch (error) {
      console.error('Error actualizando votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar votación en el servidor'
      );
    }
  }

  async deleteVoting(params: DeleteVotingParams): Promise<string> {
    const { token, businessId, groupId, votingId } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}${businessId !== undefined ? `?business_id=${businessId}` : ''
      }`;
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
      const backendResponse: BackendDeleteVotingResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al eliminar votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación eliminada: ID ${votingId}`,
        data: backendResponse,
      });

      return backendResponse.message || 'Votación desactivada';
    } catch (error) {
      console.error('Error eliminando votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar votación en el servidor'
      );
    }
  }

  async activateVoting(params: ActivateVotingParams): Promise<string> {
    const { token, businessId, groupId, votingId } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}/activate${businessId !== undefined ? `?business_id=${businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'PATCH',
      url,
      token,
      body: null, // No body required for PATCH
    });

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendActivateVotingResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al activar votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación activada: ID ${votingId}`,
        data: backendResponse,
      });

      return backendResponse.message || 'Votación activada';
    } catch (error) {
      console.error('Error activando votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al activar votación en el servidor'
      );
    }
  }

  async deactivateVoting(params: DeactivateVotingParams): Promise<string> {
    const { token, businessId, groupId, votingId } = params;
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}/deactivate${businessId !== undefined ? `?business_id=${businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'PATCH',
      url,
      token,
      body: null, // No body required for PATCH
    });

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendDeactivateVotingResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error ${response.status} al desactivar votación`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Votación desactivada: ID ${votingId}`,
        data: backendResponse,
      });

      return backendResponse.message || 'Votación desactivada';
    } catch (error) {
      console.error('Error desactivando votación:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al desactivar votación en el servidor'
      );
    }
  }
}

// ============================================
// VOTING OPTIONS REPOSITORY
// ============================================

export class VotingOptionsRepository implements IVotingOptionsRepository {
  async getVotingOptions(params: GetVotingOptionsParams): Promise<VotingOptionsList> {
    // Mantener groupId y votingId en la URL; business_id por query param
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/options${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
    });

    const duration = Date.now() - startTime;
    const data: BackendGetVotingOptionsResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(`Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `${data.data.length} opciones obtenidas`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    const options: VotingOption[] = data.data.map(option => ({
      id: option.id,
      votingId: option.voting_id,
      optionText: option.option_text,
      optionCode: option.option_code,
      displayOrder: option.display_order,
      isActive: option.is_active,
      color: option.color, // Mapear el color del backend
    }));

    return {
      options,
      total: options.length,
    };
  }

  async createVotingOption(params: CreateVotingOptionParams): Promise<VotingOption> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/options${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    const body = {
      option_text: params.data.optionText,
      option_code: params.data.optionCode,
      display_order: params.data.displayOrder,
      color: params.data.color, // Incluir el color en la request
    };

    console.log(`🎨 Enviando color al backend:`, params.data.color);
    logHttpRequest({ method: 'POST', url, body });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const data: BackendCreateVotingOptionResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(`Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Opción creada: ${data.data.option_text}`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    console.log(`🎨 Color devuelto por el backend:`, data.data.color);

    return {
      id: data.data.id,
      votingId: data.data.voting_id,
      optionText: data.data.option_text,
      optionCode: data.data.option_code,
      displayOrder: data.data.display_order,
      isActive: data.data.is_active,
      color: data.data.color, // Mapear el color de la respuesta
    };
  }

  async getVotingOptionById(params: GetVotingOptionByIdParams): Promise<VotingOption> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/options/${params.optionId}${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendVotingOptionResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        const errorMessage = (data as { error?: string }).error;
        throw new Error(errorMessage || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Opción obtenida: ${data.data.option_text}`,
        data,
      });

      return {
        id: data.data.id,
        votingId: data.data.voting_id,
        optionText: data.data.option_text,
        optionCode: data.data.option_code,
        displayOrder: data.data.display_order,
        isActive: data.data.is_active,
        color: data.data.color,
      };
    } catch (error) {
      console.error('❌ Error obteniendo opción de votación:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al obtener opción de votación');
    }
  }

  async updateVotingOptionStatus(params: UpdateVotingOptionStatusParams): Promise<VotingOption> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/options/${params.optionId}/status${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    const body = {
      is_active: params.isActive,
    };

    logHttpRequest({ method: 'PATCH', url, body });

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const data: BackendVotingOptionResponse = await response.json();

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        const errorMessage = (data as { error?: string }).error;
        throw new Error(errorMessage || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Estado de opción actualizado: ${data.data.option_text}`,
        data,
      });

      return {
        id: data.data.id,
        votingId: data.data.voting_id,
        optionText: data.data.option_text,
        optionCode: data.data.option_code,
        displayOrder: data.data.display_order,
        isActive: data.data.is_active,
        color: data.data.color,
      };
    } catch (error) {
      console.error('❌ Error actualizando estado de opción de votación:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al actualizar opción de votación');
    }
  }

  async deleteVotingOption(params: DeleteVotingOptionParams): Promise<string> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/options/${params.optionId}${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'DELETE', url });

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const duration = Date.now() - startTime;
      const data: BackendDeleteVotingOptionResponse = await response.json().catch(() => ({
        success: response.ok,
        message: response.ok ? 'Opción eliminada' : 'Error eliminando opción',
      }));

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      const message = data.message || `Opción eliminada (ID ${params.optionId})`;

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: message,
        data,
      });

      return message;
    } catch (error) {
      console.error('❌ Error eliminando opción de votación:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al eliminar opción de votación');
    }
  }
}

// ============================================
// VOTES REPOSITORY
// ============================================

export class VotesRepository implements IVotesRepository {
  async getVotes(params: GetVotesParams): Promise<VotesList> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/votes${params.businessId !== undefined ? `?business_id=${params.businessId}` : ''
      }`;
    const startTime = Date.now();

    logHttpRequest({ method: 'GET', url });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
    });

    const duration = Date.now() - startTime;
    const data: BackendGetVotesResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(`Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `${data.data.length} votos obtenidos`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    const votes: Vote[] = data.data.map(vote => ({
      id: vote.id,
      votingId: vote.voting_id,
      votingOptionId: vote.voting_option_id,
      propertyUnitId: vote.property_unit_id,
      votedAt: vote.voted_at,
      ipAddress: vote.ip_address,
      userAgent: vote.user_agent,
      notes: vote.notes,
    }));

    return {
      votes,
      total: votes.length,
    };
  }

  async createVote(params: CreateVoteParams): Promise<Vote> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/votes`;
    const startTime = Date.now();

    const body = {
      business_id: params.businessId,
      property_unit_id: params.data.propertyUnitId,
      voting_option_id: params.data.votingOptionId,
      ip_address: params.data.ipAddress,
      user_agent: params.data.userAgent,
    };

    logHttpRequest({ method: 'POST', url, body });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const data: BackendCreateVoteResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      // Devolver el mensaje de error específico de la API
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Voto registrado`,
      data,
    });

    // Mapear la respuesta del backend al dominio
    return {
      id: data.data.id,
      votingId: data.data.voting_id,
      votingOptionId: data.data.voting_option_id,
      propertyUnitId: data.data.property_unit_id,
      votedAt: data.data.voted_at,
      ipAddress: data.data.ip_address,
      userAgent: data.data.user_agent,
    };
  }

  async createBulkVotes(params: CreateBulkVotesParams): Promise<BulkVoteResult> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/votes/bulk`;
    const startTime = Date.now();

    const body = {
      property_unit_ids: params.data.propertyUnitIds,
      voting_option_id: params.data.votingOptionId,
      auto_mark_attendance: params.data.autoMarkAttendance,
      ip_address: params.data.ipAddress,
      user_agent: params.data.userAgent,
      notes: params.data.notes,
    };

    logHttpRequest({ method: 'POST', url, body });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const data: BackendCreateBulkVotesResponse = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Votación masiva: ${data.data.succeeded} exitosos, ${data.data.failed} fallidos`,
      data,
    });

    return {
      totalProcessed: data.data.total_processed,
      succeeded: data.data.succeeded,
      failed: data.data.failed,
      results: data.data.results.map(item => ({
        propertyUnitId: item.property_unit_id,
        success: item.success,
        vote: item.vote ? {
          id: item.vote.id,
          votingId: item.vote.voting_id,
          votingOptionId: item.vote.voting_option_id,
          propertyUnitId: item.vote.property_unit_id,
          votedAt: item.vote.voted_at,
          ipAddress: item.vote.ip_address,
          userAgent: item.vote.user_agent,
        } : undefined,
        error: item.error,
      })),
    };
  }

  async markUnitAttendance(params: MarkUnitAttendanceParams): Promise<void> {
    const url = `${env.API_BASE_URL}/horizontal-properties/voting-groups/${params.groupId}/votings/${params.votingId}/units/${params.unitId}/attendance`;
    const startTime = Date.now();

    const body = {
      mark_attendance: params.markAttendance,
    };

    logHttpRequest({ method: 'PUT', url, body });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.token}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      logHttpError({
        status: response.status,
        statusText: response.statusText,
        duration,
        data,
      });
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    logHttpSuccess({
      status: response.status,
      statusText: response.statusText,
      duration,
      summary: `Asistencia ${params.markAttendance ? 'marcada' : 'desmarcada'}`,
      data,
    });
  }
}
