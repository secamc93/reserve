/**
 * Repositorio de Roles
 * Maneja la consulta de roles del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { IRolesRepository } from '../../../domain/ports/roles/roles.repository';
import { Role, RolesList } from '../../../domain/entities/role.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import { BackendRolesResponse } from '../response';

export class RolesRepository implements IRolesRepository {
  async getRoles(token: string): Promise<RolesList> {
    const url = `${env.API_BASE_URL}/roles`;
    const startTime = Date.now();
    
    logHttpRequest({
      method: 'GET',
      url,
      token,
    });
    
    try {
      // Llamada al backend para obtener roles
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
        throw new Error(errorData.message || `Error obteniendo roles: ${response.status}`);
      }

      // Parsear respuesta tipada del backend
      const backendResponse: BackendRolesResponse = await response.json();
      
      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.count} roles obtenidos`,
        data: backendResponse,
      });

      // Validar que la respuesta tenga la estructura esperada
      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Mapear roles del backend a entidad del dominio
      const roles: Role[] = backendResponse.data.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        level: role.level,
        isSystem: role.is_system,
        scopeId: role.scope_id,
        scopeName: role.scope_name,
        scopeCode: role.scope_code,
      }));

      return {
        roles,
        count: backendResponse.count,
      };
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener roles del servidor'
      );
    }
  }
}

