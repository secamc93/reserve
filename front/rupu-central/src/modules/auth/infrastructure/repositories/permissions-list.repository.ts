/**
 * Repositorio de Permissions List
 * Maneja la consulta de todos los permisos del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { IPermissionsListRepository } from '../../domain/ports/permissions-list.repository';
import { Permission, PermissionsList } from '../../domain/entities/permission.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendPermissionsListResponse } from './response';

export class PermissionsListRepository implements IPermissionsListRepository {
  async getPermissions(token: string): Promise<PermissionsList> {
    const url = `${env.API_BASE_URL}/permissions`;
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
        throw new Error(errorData.message || `Error obteniendo permisos: ${response.status}`);
      }

      const backendResponse: BackendPermissionsListResponse = await response.json();
      
      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.total} permisos obtenidos`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear permisos del backend a entidad del dominio
      const permissions: Permission[] = backendResponse.data.map(permission => ({
        id: permission.id,
        name: permission.name,
        code: permission.code,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        scopeId: permission.scope_id,
        scopeName: permission.scope_name,
        scopeCode: permission.scope_code,
      }));

      return {
        permissions,
        total: backendResponse.total,
      };
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener permisos del servidor'
      );
    }
  }
}

