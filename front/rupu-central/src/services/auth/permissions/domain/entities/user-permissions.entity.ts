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

export const VOTING_RESOURCE = 'Votaciones';
/** Marcar asistencia y apoderados (lo único que modifica un consejero). */
export const ATTENDANCE_RESOURCE = 'Asistencia';

type PermissionsLike = Pick<UserPermissions, 'isSuperAdmin' | 'resources'> | null | undefined;

/**
 * ¿El rol tiene el recurso (activo) y, si se pide, la acción? El super admin lo tiene todo.
 * Las acciones son las de la tabla action: Create, Read, Update, Delete.
 */
export function permissionsAllow(permissions: PermissionsLike, resource: string, action?: string): boolean {
  if (!permissions) return false;
  if (permissions.isSuperAdmin) return true;
  return permissions.resources.some(
    (r) => r.resource === resource && r.active && (action === undefined || r.actions.includes(action)),
  );
}

/** Qué puede hacer el rol en Votaciones (el back aplica las mismas reglas: module_access.go). */
export interface VotingCapabilities {
  /** Crear/editar/eliminar grupos y votaciones, iniciarlas o cerrarlas, QR y listas de asistencia. */
  canManage: boolean;
  /** Marcar asistencia y agregar o quitar apoderados. */
  canMarkAttendance: boolean;
  canGeneratePasswords: boolean;
  canViewLive: boolean;
}

export function votingCapabilities(permissions: PermissionsLike): VotingCapabilities {
  const canManage = permissionsAllow(permissions, VOTING_RESOURCE, 'Update');
  return {
    canManage,
    canMarkAttendance: canManage || permissionsAllow(permissions, ATTENDANCE_RESOURCE, 'Update'),
    canGeneratePasswords: permissionsAllow(permissions, VOTING_PASSWORDS_RESOURCE, 'Create'),
    canViewLive: permissionsAllow(permissions, VOTING_LIVE_RESOURCE, 'Read'),
  };
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
