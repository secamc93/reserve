/**
 * Repositorio de Resources
 * Maneja la consulta de recursos/módulos del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { IResourcesRepository, GetResourcesParams, CreateResourceParams, UpdateResourceParams, DeleteResourceParams } from '../../../domain/ports/resources/resources.repository';
import { Resource, ResourcesList } from '@modules/auth/domain/entities/resource.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendResourcesResponse, BackendCreateResourceResponse, BackendUpdateResourceResponse, BackendDeleteResourceResponse } from '../response';

export class ResourcesRepository implements IResourcesRepository {
  async getResources(params: GetResourcesParams): Promise<ResourcesList> {
    const { page = 1, pageSize = 10, name, description, sortBy, sortOrder, token } = params;
    
    // Construir query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (name) queryParams.append('name', name);
    if (description) queryParams.append('description', description);
    if (sortBy) queryParams.append('sort_by', sortBy);
    if (sortOrder) queryParams.append('sort_order', sortOrder);
    
    const url = `${env.API_BASE_URL}/resources?${queryParams.toString()}`;
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
        throw new Error(errorData.message || `Error obteniendo recursos: ${response.status}`);
      }

      const backendResponse: BackendResourcesResponse = await response.json();
      
      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.total} recursos (página ${backendResponse.data.page}/${backendResponse.data.total_pages})`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear recursos del backend a entidad del dominio
      const resources: Resource[] = backendResponse.data.resources.map(resource => ({
        id: resource.id,
        name: resource.name,
        description: resource.description,
        createdAt: new Date(resource.created_at),
        updatedAt: new Date(resource.updated_at),
      }));

      return {
        resources,
        total: backendResponse.data.total,
        page: backendResponse.data.page,
        pageSize: backendResponse.data.page_size,
        totalPages: backendResponse.data.total_pages,
      };
    } catch (error) {
      console.error('Error obteniendo recursos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener recursos del servidor'
      );
    }
  }

  async createResource(params: CreateResourceParams): Promise<Resource> {
    const { name, description, token } = params;
    const url = `${env.API_BASE_URL}/resources`;
    const startTime = Date.now();
    
    const body = { name, description };
    
    logHttpRequest({
      method: 'POST',
      url,
      token,
      body,
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendCreateResourceResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || backendResponse.message || `Error creando recurso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Recurso "${backendResponse.data?.name}" creado`,
        data: backendResponse,
      });

      if (!backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear recurso del backend a entidad del dominio
      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        createdAt: new Date(backendResponse.data.created_at),
        updatedAt: new Date(backendResponse.data.updated_at),
      };
    } catch (error) {
      console.error('Error creando recurso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear recurso en el servidor'
      );
    }
  }

  async updateResource(params: UpdateResourceParams): Promise<Resource> {
    const { id, name, description, token } = params;
    const url = `${env.API_BASE_URL}/resources/${id}`;
    const startTime = Date.now();
    
    const body = { name, description };
    
    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body,
    });
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;
      const backendResponse: BackendUpdateResourceResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || backendResponse.message || `Error actualizando recurso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Recurso "${backendResponse.data?.name}" actualizado`,
        data: backendResponse,
      });

      if (!backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear recurso del backend a entidad del dominio
      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        createdAt: new Date(backendResponse.data.created_at),
        updatedAt: new Date(backendResponse.data.updated_at),
      };
    } catch (error) {
      console.error('Error actualizando recurso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar recurso en el servidor'
      );
    }
  }

  async deleteResource(params: DeleteResourceParams): Promise<void> {
    const { id, token } = params;
    const url = `${env.API_BASE_URL}/resources/${id}`;
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
      const backendResponse: BackendDeleteResourceResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error eliminando recurso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Recurso ID ${id} eliminado`,
        data: backendResponse,
      });
    } catch (error) {
      console.error('Error eliminando recurso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar recurso del servidor'
      );
    }
  }
}

