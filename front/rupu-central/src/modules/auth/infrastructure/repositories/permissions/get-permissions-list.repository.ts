/**
 * Repositorio de Permisos - Obtener Lista de Permisos
 * Maneja la consulta de la lista completa de permisos
 * IMPORTANTE: Este archivo es server-only
 */

import { PermissionsList } from '../../../domain/entities/permission.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendPermissionsListResponse } from '../response';

export class GetPermissionsListRepository {
  async getPermissions(token: string, params?: { business_type_id?: number }): Promise<PermissionsList> {
    // Construir URL con query params
    const url = new URL(`${env.API_BASE_URL}/permissions`);
    
    if (params?.business_type_id) {
      url.searchParams.append('business_type_id', params.business_type_id.toString());
    }
    
    const startTime = Date.now();

    logHttpRequest({
      method: 'GET',
      url: url.toString(),
      token,
    });
    
    try {
      const response = await fetch(url.toString(), {
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
        throw new Error(errorData.message || `Error obteniendo lista de permisos: ${response.status}`);
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

      const permissions = backendResponse.data.map(permission => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        resourceId: permission.resource_id,
        action: permission.action,
        actionId: permission.action_id,
        scopeId: permission.scope_id,
        scopeName: permission.scope_name,
        scopeCode: permission.scope_code,
        businessTypeId: permission.business_type_id,
        businessTypeName: permission.business_type_name,
      }));

      return {
        permissions,
        total: backendResponse.total,
      };
    } catch (error) {
      console.error('Error obteniendo lista de permisos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener lista de permisos del servidor'
      );
    }
  }
}
