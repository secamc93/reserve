/**
 * Repositorio de Roles
 * Maneja la consulta de roles del sistema
 * IMPORTANTE: Este archivo es server-only
 */

import { IRolesRepository } from '../../../domain/ports/roles/roles.repository';
import { Role, RolesList } from '../../domain/entities/role.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

interface BackendRoleData {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
  scope_name: string;
  scope_code: string;
  business_type_id: number;
  business_type_name: string;
}

interface BackendRolesResponse {
  success: boolean;
  data: BackendRoleData[];
  count: number;
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export class RolesRepository implements IRolesRepository {
  async getRoles(token: string, params?: {
    page?: number;
    page_size?: number;
    business_type_id?: number;
    scope_id?: number;
    is_system?: boolean;
    name?: string;
    level?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<RolesList> {
    // Construir URL con query params
    const url = new URL(`${env.API_BASE_URL}/roles`);
    
    // Paginación
    if (params?.page) {
      url.searchParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      url.searchParams.append('page_size', params.page_size.toString());
    }
    
    // Filtros
    if (params?.business_type_id) {
      url.searchParams.append('business_type_id', params.business_type_id.toString());
    }
    if (params?.scope_id) {
      url.searchParams.append('scope_id', params.scope_id.toString());
    }
    if (params?.is_system !== undefined) {
      url.searchParams.append('is_system', params.is_system.toString());
    }
    if (params?.name) {
      url.searchParams.append('name', params.name);
    }
    if (params?.level) {
      url.searchParams.append('level', params.level.toString());
    }
    
    // Ordenamiento
    if (params?.sort_by) {
      url.searchParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      url.searchParams.append('sort_order', params.sort_order);
    }
    
    const startTime = Date.now();
    
    logHttpRequest({
      method: 'GET',
      url: url.toString(),
      token,
    });
    
    try {
      // Llamada al backend para obtener roles
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
        throw new Error(errorData.message || `Error obteniendo roles: ${response.status}`);
      }

      // Parsear respuesta tipada del backend
      const backendResponse: BackendRolesResponse = await response.json();
      
      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `${backendResponse.total || backendResponse.count} roles obtenidos`,
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
        businessTypeId: role.business_type_id,
        businessTypeName: role.business_type_name,
      }));

      return {
        roles,
        count: backendResponse.total || backendResponse.count || roles.length,
      };
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener roles del servidor'
      );
    }
  }
}

