/**
 * Control de acceso basado en roles (RBAC)
 * Define permisos y roles de manera centralizada
 */

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum Permission {
  // Auth
  AUTH_LOGIN = 'auth:login',
  AUTH_MANAGE_ROLES = 'auth:manage_roles',
  AUTH_MANAGE_PERMISSIONS = 'auth:manage_permissions',
  
  // Property Horizontal
  PH_VIEW_DASHBOARD = 'ph:view_dashboard',
  PH_MANAGE_UNITS = 'ph:manage_units',
  PH_MANAGE_FEES = 'ph:manage_fees',
  PH_VIEW_REPORTS = 'ph:view_reports',
}

// Mapeo de permisos por rol
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.AUTH_LOGIN,
    Permission.AUTH_MANAGE_ROLES,
    Permission.AUTH_MANAGE_PERMISSIONS,
    Permission.PH_VIEW_DASHBOARD,
    Permission.PH_MANAGE_UNITS,
    Permission.PH_MANAGE_FEES,
    Permission.PH_VIEW_REPORTS,
  ],
  [Role.MANAGER]: [
    Permission.AUTH_LOGIN,
    Permission.PH_VIEW_DASHBOARD,
    Permission.PH_MANAGE_UNITS,
    Permission.PH_MANAGE_FEES,
    Permission.PH_VIEW_REPORTS,
  ],
  [Role.USER]: [
    Permission.AUTH_LOGIN,
    Permission.PH_VIEW_DASHBOARD,
    Permission.PH_VIEW_REPORTS,
  ],
  [Role.GUEST]: [
    Permission.AUTH_LOGIN,
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Verifica si un rol tiene alguno de los permisos especificados
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

