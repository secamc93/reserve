/**
 * Repositorio de Infraestructura: Obtener Permisos de un Rol
 */

import { IGetRolePermissionsRepository } from '../../../domain/ports/roles/get-role-permissions.repository';
import { GetRolePermissionsInput, GetRolePermissionsResult, RolePermission } from '../../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface BackendRolePermissionsResponse {
  success: boolean;
  message: string;
  role_id: number;
  role_name: string;
  permissions: RolePermission[];
  count: number;
}

export class GetRolePermissionsRepository implements IGetRolePermissionsRepository {
  async getRolePermissions(input: GetRolePermissionsInput, token: string): Promise<GetRolePermissionsResult> {
    const url = `${env.API_BASE_URL}/roles/${input.role_id}/permissions`;
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
        throw new Error(errorData.error || `Error obteniendo permisos del rol: ${response.status}`);
      }

      const backendResponse: BackendRolePermissionsResponse = await response.json();
      
      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.count} permisos obtenidos para el rol ${backendResponse.role_name}`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        success: true,
        data: {
          role_id: backendResponse.role_id,
          role_name: backendResponse.role_name,
          permissions: backendResponse.permissions,
          count: backendResponse.count,
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
        error: error instanceof Error ? error.message : 'Error desconocido al obtener permisos del rol',
      };
    }
  }
}

