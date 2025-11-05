/**
 * Repositorio de Actions
 * Maneja las operaciones CRUD de actions
 * IMPORTANTE: Este archivo es server-only
 */

import { IActionsRepository } from '../../../domain/ports/actions';
import {
  GetActionsParams,
  ActionsList,
  GetActionByIdParams,
  CreateActionParams,
  CreateActionResponse,
  UpdateActionParams,
  UpdateActionResponse,
  DeleteActionParams,
  DeleteActionResponse,
} from '../../../domain/entities/action.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  BackendActionsResponse,
  BackendGetActionByIdResponse,
  BackendCreateActionResponse,
  BackendUpdateActionResponse,
  BackendDeleteActionResponse,
} from '../response/actions.response';

export class ActionsRepository implements IActionsRepository {
  async getActions(params: GetActionsParams): Promise<ActionsList> {
    const { token, page = 1, page_size = 10, name } = params;

    // Construir query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });

    if (name && name.trim() !== '') {
      queryParams.append('name', name.trim());
    }

    const url = `${env.API_BASE_URL}/actions?${queryParams.toString()}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo actions: ${response.status}`);
      }

      const backendResponse: BackendActionsResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.total} actions (página ${backendResponse.data.page}/${backendResponse.data.total_pages})`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear actions del backend a entidad del dominio
      const actions = (backendResponse.data.actions || []).map((action) => ({
        id: action.id,
        name: action.name,
        description: action.description,
        created_at: action.created_at,
        updated_at: action.updated_at,
      }));

      return {
        actions,
        total: backendResponse.data.total,
        page: backendResponse.data.page,
        page_size: backendResponse.data.page_size,
        total_pages: backendResponse.data.total_pages,
      };
    } catch (error) {
      console.error('Error obteniendo actions:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener actions del servidor'
      );
    }
  }

  async getActionById(params: GetActionByIdParams): Promise<CreateActionResponse> {
    const { token, actionId } = params;

    const url = `${env.API_BASE_URL}/actions/${actionId}`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error obteniendo action: ${response.status}`);
      }

      const backendResponse: BackendGetActionByIdResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Action obtenido: ${backendResponse.data.name}`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        created_at: backendResponse.data.created_at,
        updated_at: backendResponse.data.updated_at,
      };
    } catch (error) {
      console.error('Error obteniendo action por ID:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener action del servidor'
      );
    }
  }

  async createAction(params: CreateActionParams): Promise<CreateActionResponse> {
    const { token, name, description } = params;

    const url = `${env.API_BASE_URL}/actions`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'POST',
      url,
      token,
      body: { name, description },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
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
        throw new Error(errorData.message || `Error creando action: ${response.status}`);
      }

      const backendResponse: BackendCreateActionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Action creado: ${backendResponse.data.name}`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        created_at: backendResponse.data.created_at,
        updated_at: backendResponse.data.updated_at,
      };
    } catch (error) {
      console.error('Error creando action:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear action en el servidor'
      );
    }
  }

  async updateAction(params: UpdateActionParams): Promise<UpdateActionResponse> {
    const { token, actionId, name, description } = params;

    const url = `${env.API_BASE_URL}/actions/${actionId}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body: { name, description },
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
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
        throw new Error(errorData.message || `Error actualizando action: ${response.status}`);
      }

      const backendResponse: BackendUpdateActionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Action actualizado: ${backendResponse.data.name}`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        created_at: backendResponse.data.created_at,
        updated_at: backendResponse.data.updated_at,
      };
    } catch (error) {
      console.error('Error actualizando action:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar action en el servidor'
      );
    }
  }

  async deleteAction(params: DeleteActionParams): Promise<DeleteActionResponse> {
    const { token, actionId } = params;

    const url = `${env.API_BASE_URL}/actions/${actionId}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'DELETE',
      url,
      token,
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: errorData,
        });
        throw new Error(errorData.message || `Error eliminando action: ${response.status}`);
      }

      const backendResponse: BackendDeleteActionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Action eliminado con ID: ${actionId}`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        success: true,
        message: backendResponse.message || `Action eliminado con ID: ${actionId}`,
      };
    } catch (error) {
      console.error('Error eliminando action:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar action del servidor'
      );
    }
  }
}

