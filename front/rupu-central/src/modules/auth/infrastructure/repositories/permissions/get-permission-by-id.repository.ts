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

      const permission = backendResponse.data;

      return {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        scope_id: permission.scope_id,
        scope_name: permission.scope_name,
        scope_code: permission.scope_code,
      };
    } catch (error) {
      console.error('Error obteniendo permiso por ID:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener permiso del servidor'
      );
    }
  }
}
