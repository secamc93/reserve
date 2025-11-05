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

