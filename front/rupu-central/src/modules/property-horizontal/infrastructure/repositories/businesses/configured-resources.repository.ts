/**
 * Implementación del repositorio de Configured Resources
 */

import { 
  IBusinessConfiguredResourcesRepository, 
  GetBusinessConfiguredResourcesParams,
  ActivateResourceParams,
  DeactivateResourceParams,
} from '../../../domain/ports';
import { BusinessConfiguredResources } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendBusinessConfiguredResourcesResponse } from '../response';

export class BusinessConfiguredResourcesRepository implements IBusinessConfiguredResourcesRepository {
  async getBusinessConfiguredResources(params: GetBusinessConfiguredResourcesParams): Promise<BusinessConfiguredResources> {
    const { token, businessId } = params;

    const url = `${env.API_BASE_URL}/businesses/${businessId}/configured-resources`;
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
      const backendResponse: BackendBusinessConfiguredResourcesResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || `Error obteniendo recursos configurados: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.data.resources.length} recursos configurados obtenidos`,
        data: backendResponse,
      });

      // Mapear la respuesta del backend al dominio
      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        code: backendResponse.data.code,
        resources: backendResponse.data.resources.map(resource => ({
          resource_id: resource.resource_id,
          resource_name: resource.resource_name,
          is_active: resource.is_active,
        })),
        created_at: backendResponse.data.created_at,
        updated_at: backendResponse.data.updated_at,
      };
    } catch (error) {
      console.error('Error obteniendo recursos configurados:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener recursos configurados del servidor'
      );
    }
  }

  async activateResource(params: ActivateResourceParams): Promise<void> {
    const { token, resourceId, businessId } = params;

    const url = new URL(`${env.API_BASE_URL}/businesses/configured-resources/${resourceId}/activate`);
    url.searchParams.append('business_id', businessId.toString());
    const startTime = Date.now();

    logHttpRequest({
      method: 'PUT',
      url: url.toString(),
      token,
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const result = await response.json();

      if (!response.ok || !result.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: result,
        });
        throw new Error(result.message || `Error activando recurso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Recurso activado exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error activando recurso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al activar el recurso del servidor'
      );
    }
  }

  async deactivateResource(params: DeactivateResourceParams): Promise<void> {
    const { token, resourceId, businessId } = params;

    const url = new URL(`${env.API_BASE_URL}/businesses/configured-resources/${resourceId}/deactivate`);
    url.searchParams.append('business_id', businessId.toString());
    const startTime = Date.now();

    logHttpRequest({
      method: 'PUT',
      url: url.toString(),
      token,
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const duration = Date.now() - startTime;
      const result = await response.json();

      if (!response.ok || !result.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: result,
        });
        throw new Error(result.message || `Error desactivando recurso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Recurso desactivado exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error desactivando recurso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al desactivar el recurso del servidor'
      );
    }
  }
}
