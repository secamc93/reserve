/**
 * Repositorio de Permissions
 * Maneja las operaciones CRUD de permissions
 * IMPORTANTE: Este archivo es server-only
 */

import { IPermissionsRepository } from '../../domain/ports';
import {
  GetPermissionsParams,
  PermissionsList,
  CreatePermissionParams,
  CreatePermissionResponse,
  UpdatePermissionParams,
  UpdatePermissionResponse,
  DeletePermissionParams,
  DeletePermissionResponse,
  GetPermissionByIdParams,
  GetPermissionByIdResponse,
} from '../../domain/entities/permission.entity';
import {
  GetUserPermissionsParams,
  UserPermissions,
} from '../../domain/entities';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  BackendPermissionsListResponse,
  BackendGetPermissionByIdResponse,
  BackendCreatePermissionResponse,
  BackendUpdatePermissionResponse,
  BackendDeletePermissionResponse,
  BackendPermissionsResponse,
} from './response/permissions.response';

export class PermissionsRepository implements IPermissionsRepository {
  async getPermissions(params: GetPermissionsParams): Promise<PermissionsList> {
    const { token, business_type_id } = params;

    const url = new URL(`${env.API_BASE_URL}/permissions`);
    if (business_type_id) {
      url.searchParams.append('business_type_id', business_type_id.toString());
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

  async getUserPermissions(params: GetUserPermissionsParams): Promise<UserPermissions> {
    const { businessId, token } = params;
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

      const { is_super, role, resources } = backendResponse.data;

      // Validar que el usuario tenga recursos y permisos asociados
      if (!is_super && (!resources || resources === null || (Array.isArray(resources) && resources.length === 0))) {
        throw new Error('Este usuario no tiene rol asociado o no tiene recursos y permisos asignados. Por favor, contacte al administrador.');
      }

      return {
        isSuperAdmin: is_super,
        roles: [role],
        resources: resources || [],
      };
    } catch (error) {
      console.error('Error obteniendo roles y permisos:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener roles y permisos del servidor'
      );
    }
  }

  async getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse> {
    const { id, token } = params;
    const url = `${env.API_BASE_URL}/permissions/${id}`;
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
        throw new Error(errorData.message || `Error obteniendo permiso: ${response.status}`);
      }

      const backendResponse: BackendGetPermissionByIdResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso ${backendResponse.data.name} obtenido exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success || !backendResponse.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        id: backendResponse.data.id,
        name: backendResponse.data.name,
        description: backendResponse.data.description,
        resource: backendResponse.data.resource,
        resource_id: backendResponse.data.resource_id,
        action: backendResponse.data.action,
        action_id: backendResponse.data.action_id,
        scope_id: backendResponse.data.scope_id,
        scope_name: backendResponse.data.scope_name,
        scope_code: backendResponse.data.scope_code,
        business_type_id: backendResponse.data.business_type_id,
        business_type_name: backendResponse.data.business_type_name,
      };
    } catch (error) {
      console.error('Error obteniendo permiso por ID:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al obtener permiso del servidor'
      );
    }
  }

  async createPermission(params: CreatePermissionParams): Promise<CreatePermissionResponse> {
    const { token, name, description, resource_id, action_id, scope_id, business_type_id } = params;
    const url = `${env.API_BASE_URL}/permissions`;
    const startTime = Date.now();

    const requestBody: Record<string, unknown> = {
      name: name.trim(),
      description: description?.trim(),
      resource_id,
      action_id,
      scope_id,
    };

    if (business_type_id) {
      requestBody.business_type_id = business_type_id;
    }

    if (!requestBody.name) {
      throw new Error('El nombre del permiso es requerido');
    }

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
      const backendResponse: BackendCreatePermissionResponse = await response.json();

      if (!response.ok || !backendResponse.success) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data: backendResponse,
        });
        throw new Error(backendResponse.message || backendResponse.error || `Error creando permiso: ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso "${backendResponse.data?.name || name}" creado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.data) {
        // Intentar extraer el ID del mensaje
        let permissionId = 0;
        const idMatch = backendResponse.message?.match(/ID:\s*(\d+)/);
        if (idMatch) {
          permissionId = parseInt(idMatch[1], 10);
        }

        return {
          success: true,
          data: {
            id: permissionId,
            name,
            description: description || '',
            resource_id,
            action_id,
            scope_id,
            business_type_id,
          },
        };
      }

      return {
        success: true,
        data: {
          id: backendResponse.data.id,
          name: backendResponse.data.name,
          description: backendResponse.data.description,
          resource_id: backendResponse.data.resource_id,
          action_id: backendResponse.data.action_id,
          scope_id: backendResponse.data.scope_id,
          business_type_id: backendResponse.data.business_type_id,
        },
      };
    } catch (error) {
      console.error('Error creando permiso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al crear permiso en el servidor'
      );
    }
  }

  async updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse> {
    const { id, token, name, description, resource_id, action_id, scope_id, business_type_id } = params;
    const url = `${env.API_BASE_URL}/permissions/${id}`;
    const startTime = Date.now();

    const requestBody: Record<string, unknown> = {
      name,
      description,
      resource_id,
      action_id,
      scope_id,
    };

    if (typeof business_type_id === 'number') {
      requestBody.business_type_id = business_type_id;
    }

    logHttpRequest({
      method: 'PUT',
      url,
      token,
      body: requestBody,
    });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
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
        throw new Error(errorData.message || `Error actualizando permiso: ${response.status}`);
      }

      const backendResponse: BackendUpdatePermissionResponse = await response.json();

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: `Permiso ${name} actualizado exitosamente`,
        data: backendResponse,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.message || 'Respuesta inválida del servidor al actualizar permiso');
      }

      return {
        success: backendResponse.success,
        message: backendResponse.message,
      };
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Error al actualizar permiso del servidor'
      );
    }
  }

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
