/**
 * Mapper para roles y permisos
 * Convierte del backend (snake_case) al dominio (camelCase)
 * 
 * RESUELVE EL PROBLEMA REAL:
 * - resource_name → resourceName
 * - is_super → isSuper
 */

import type { RolesPermissionsData } from '../response/roles-permissions';
import type { RolesPermissionsData as DomainRolesPermissionsData } from '@/services/auth/domain/entities/roles-permissions';

/**
 * Convierte la respuesta de roles y permisos del backend al dominio
 */
export function mapRolesPermissionsResponseToDomain(
  backendResponse: RolesPermissionsData
): DomainRolesPermissionsData {
  return {
    isSuper: backendResponse.is_super,                    // ← snake_case → camelCase
    roles: backendResponse.roles.map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      level: role.level,
      scope: role.scope
    })),
    resources: backendResponse.resources.map(resource => ({
      resource: resource.resource,
      resourceName: resource.resource_name,               // ← snake_case → camelCase
      actions: resource.actions.map(action => ({
        id: action.id,
        name: action.name,
        code: action.code,
        description: action.description,
        resource: action.resource,
        action: action.action,
        scope: action.scope
      }))
    }))
  };
} 