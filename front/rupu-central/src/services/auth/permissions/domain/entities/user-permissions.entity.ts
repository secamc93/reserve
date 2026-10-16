/**
 * Entidad de dominio: UserPermissions (Permisos del Usuario)
 */

export interface PermissionRole {
  id: number;
  name: string;
  description: string;
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  active: boolean;
}

export interface UserPermissions {
  isSuperAdmin: boolean;
  roles: PermissionRole[];
  resources: ResourcePermission[];
}

/**
 * Recurso para generar (o regenerar) las contraseñas de voto de un grupo. Va aparte de
 * Votaciones: un consejero opera la asamblea pero no cambia las contraseñas ya entregadas.
 * El back aplica la misma regla (services/auth/middleware/module_access.go).
 */
export const VOTING_PASSWORDS_RESOURCE = 'Contraseñas de votación';

/** Recurso para ver el panel en vivo de una votación (y su stream). También va aparte de Votaciones. */
export const VOTING_LIVE_RESOURCE = 'Votación en vivo';

/** ¿Los permisos (los de TokenStorage) incluyen el recurso? El super admin lo tiene todo. */
export function permissionsInclude(
  permissions: Pick<UserPermissions, 'isSuperAdmin' | 'resources'> | null | undefined,
  resource: string,
): boolean {
  if (!permissions) return false;
  if (permissions.isSuperAdmin) return true;
  return permissions.resources.some((r) => r.resource === resource && r.active);
}

/**
 * Mapeo de recursos a rutas/modulos de la aplicación
 * Cada recurso del backend se mapea a las rutas que debe permitir
 */
export const RESOURCE_ROUTE_MAP: Record<string, string[]> = {
  'Residentes': [
    '/properties',
    '/properties/[id]/residents',
  ],
  'Propiedades': [
    '/properties',
    '/properties/[id]',
  ],
  'Unidades': [
    '/properties/[id]/units',
  ],
  'Votaciones': [
    '/properties/[id]/voting-groups',
    '/properties/[id]/voting-groups/[groupId]',
    '/public/vote',
  ],
  'Asistencia': [
    '/properties/[id]/attendance',
    '/properties/[id]/voting-groups/[groupId]/attendance',
    '/properties/[id]/voting-groups/[groupId]/attendance/[attendanceListId]',
  ],
  'Visitas': [
    '/properties/[id]/visits',
  ],
  'Paquetería': [
    '/properties/[id]/packages',
  ],
  'Parqueaderos': [
    '/properties/[id]/parking',
  ],
  'Zonas Comunes': [
    '/properties/[id]/common-areas',
  ],
  'Usuarios': [
    '/iam/users',
    '/users',
  ],
  'Roles': [
    '/iam/roles',
  ],
  'Permisos': [
    '/iam/permissions',
  ],
  'Recursos': [
    '/iam/resources',
  ],
  'Tipos de Negocio': [
    '/iam/business-types',
  ],
  'Negocios': [
    '/iam/businesses',
  ],
};

export interface GetUserPermissionsParams {
  businessId: number;
  token: string;
}
