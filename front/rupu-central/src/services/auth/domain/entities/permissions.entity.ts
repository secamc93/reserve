/**
 * Entidades de Permisos (Domain)
 * Representa roles y permisos en el dominio de negocio
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

