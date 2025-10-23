/**
 * Repositorio de Permisos - Actualizar Permiso
 * Maneja la actualización de permisos del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { UpdatePermissionParams, UpdatePermissionResponse } from '../../../domain/entities/update-permission.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendUpdatePermissionResponse } from './response/permissions.response';

export class UpdatePermissionRepository {
  async updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse> {
    const { id, token, name, code, description, resource, action, scope_id } = params;

    const url = `${env.API_BASE_URL}/permissions/${id}`;
    const startTime = Date.now();

    logHttpRequest({
      method: 'PUT',
      url,
      token,
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          code,
          description,
          resource,
          action,
          scope_id,
        }),
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
        throw new Error(errorData.message || `Error actualizando permiso: ${response.status}`);
      }

      const backendResponse: BackendUpdatePermissionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso ${name} actualizado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Respuesta inválida del servidor al actualizar permiso');
      }

      return {
        success: backendResponse.success,
        message: backendResponse.message,
      };
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar permiso del servidor'
      );
    }
  }
}
