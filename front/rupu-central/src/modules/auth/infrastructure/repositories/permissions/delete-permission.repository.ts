/**
 * Repositorio de Permisos - Eliminar Permiso
 * Maneja la eliminación de permisos del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { DeletePermissionParams, DeletePermissionResponse } from '../../../domain/entities/delete-permission.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendDeletePermissionResponse } from './response/permissions.response';

export class DeletePermissionRepository {
  async deletePermission(params: DeletePermissionParams): Promise<DeletePermissionResponse> {
    const { id, token } = params;

    const url = `${env.API_BASE_URL}/permissions/${id}`;
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
        throw new Error(errorData.message || `Error eliminando permiso: ${response.status}`);
      }

      const backendResponse: BackendDeletePermissionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso con ID ${id} eliminado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Respuesta inválida del servidor al eliminar permiso');
      }

      return {
        success: backendResponse.success,
        message: backendResponse.message,
      };
    } catch (error) {
      console.error('Error eliminando permiso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al eliminar permiso del servidor'
      );
    }
  }
}
