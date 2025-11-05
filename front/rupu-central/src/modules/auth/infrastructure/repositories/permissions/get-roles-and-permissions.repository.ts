/**
 * Repositorio de Permisos - Obtener Roles y Permisos
 * Maneja la consulta de roles y permisos por negocio
 * IMPORTANTE: Este archivo es server-only
 */

import { UserPermissions } from '../../../domain/entities/permissions.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendPermissionsResponse } from '../response';

export class GetRolesAndPermissionsRepository {
  async getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions> {
    const url = `${env.API_BASE_URL}/auth/roles-permissions?business_id=${businessId}`;
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
        throw new Error(errorData.message || `Error obteniendo roles y permisos: ${response.status}`);
      }

      const backendResponse: BackendPermissionsResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Roles y permisos obtenidos para negocio ${businessId}`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { is_super, roles, resources } = backendResponse.data;

      return {
        isSuperAdmin: is_super,
        roles: roles,
        resources: resources,
      };
    } catch (error) {
      console.error('Error obteniendo roles y permisos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener roles y permisos del servidor'
      );
    }
  }
}
