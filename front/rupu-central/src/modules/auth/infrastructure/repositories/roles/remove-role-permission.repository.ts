/**
 * Repositorio de Infraestructura: Remover Permiso de un Rol
 */

import { IRemoveRolePermissionRepository } from '../../../domain/ports/roles/remove-role-permission.repository';
import { RemoveRolePermissionInput, RemoveRolePermissionResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendRemovePermissionResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class RemoveRolePermissionRepository implements IRemoveRolePermissionRepository {
  async removePermission(input: RemoveRolePermissionInput, token: string): Promise<RemoveRolePermissionResult> {
    const url = `${env.API_BASE_URL}/roles/${input.role_id}/permissions/${input.permission_id}`;
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
      const backendResponse: BackendRemovePermissionResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || `Error removiendo permiso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso ${input.permission_id} removido exitosamente del rol ${input.role_id}`,
        data: backendResponse,
      });

      return {
        success: true,
        message: backendResponse.message,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Error desconocido' },
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al remover permiso',
      };
    }
  }
}

