/**
 * Repositorio de Permisos
 * Maneja la consulta de roles y permisos por negocio
 * IMPORTANTE: Este archivo es server-only
 */

import { IPermissionsRepository } from '../../domain/ports/permissions.repository';
import { UserPermissions } from '../../domain/entities/permissions.entity';
import { env } from '@shared/config/env';
import { BackendPermissionsResponse } from './response';

export class PermissionsRepository implements IPermissionsRepository {
  async getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions> {
    try {
      // Llamada al backend para obtener roles y permisos
      const response = await fetch(
        `${env.API_BASE_URL}/auth/roles-permissions?business_id=${businessId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error obteniendo permisos: ${response.status}`);
      }

      // Parsear respuesta tipada del backend
      const backendResponse: BackendPermissionsResponse = await response.json();

      // Validar que la respuesta tenga la estructura esperada
      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      const { is_super, roles, resources } = backendResponse.data;

      // Mapear a entidad del dominio
      const permissions: UserPermissions = {
        isSuperAdmin: is_super,
        roles: roles,
        resources: resources,
      };

      return permissions;
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener permisos del servidor'
      );
    }
  }
}

