/**
 * Repositorio de Infraestructura: Asignar Permisos a Rol
 */

import { IAssignRolePermissionsRepository } from '../../../domain/ports/roles/assign-role-permissions.repository';
import { AssignRolePermissionsInput, AssignRolePermissionsResult } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendAssignPermissionsRequest {
  permission_ids: number[];
}

export interface BackendAssignPermissionsResponse {
  success: boolean;
  message: string;
  role_id?: number;
  permission_ids?: number[];
  error?: string;
}

export class AssignRolePermissionsRepository implements IAssignRolePermissionsRepository {
  async assignPermissions(input: AssignRolePermissionsInput, token: string): Promise<AssignRolePermissionsResult> {
    const url = `${env.API_BASE_URL}/roles/${input.role_id}/permissions`;
    const startTime = Date.now();
    
    const requestBody: BackendAssignPermissionsRequest = {
      permission_ids: input.permission_ids,
    };
    
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
      const backendResponse: BackendAssignPermissionsResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.error || `Error asignando permisos: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permisos asignados exitosamente al rol ${input.role_id}`,
        data: backendResponse,
      });

      return {
        success: true,
        data: {
          role_id: backendResponse.role_id || input.role_id,
          permission_ids: backendResponse.permission_ids || input.permission_ids,
        },
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
        error: error instanceof Error ? error.message : 'Error desconocido al asignar permisos',
      };
    }
  }
}

