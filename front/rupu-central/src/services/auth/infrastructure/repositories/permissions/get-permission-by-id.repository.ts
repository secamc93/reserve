/**
 * Repositorio de Permisos - Obtener Permiso por ID
 * Maneja la consulta de un permiso específico por su ID
 * IMPORTANTE: Este archivo es server-only
 */

import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../../../domain/entities/get-permission-by-id.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendGetPermissionByIdResponse } from './response/permissions.response';

export class GetPermissionByIdRepository {
  async getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse> {
    const { id, token } = params;

    const url = `${env.API_BASE_URL}/permissions/${id}`;
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
        throw new Error(errorData.message || `Error obteniendo permiso: ${response.status}`);
      }

      const backendResponse: BackendGetPermissionByIdResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso ${backendResponse.data.name} obtenido exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        resource: backendResponse.data.resource,
        resource_id: backendResponse.data.resource_id,
        action: backendResponse.data.action,
        action_id: backendResponse.data.action_id,
        scope_id: backendResponse.data.scope_id,
        scope_name: backendResponse.data.scope_name,
        scope_code: backendResponse.data.scope_code,
        business_type_id: backendResponse.data.business_type_id,
        business_type_name: backendResponse.data.business_type_name,
      };
    } catch (error) {
      console.error('Error obteniendo permiso por ID:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener permiso del servidor'
      );
    }
  }
}
