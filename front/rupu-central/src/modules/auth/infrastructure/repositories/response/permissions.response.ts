/**
 * Interfaces para la respuesta del backend - Permisos
 * Mapea la estructura de roles y permisos por negocio
 */

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  active: boolean;
}

export interface PermissionsData {
  is_super: boolean;
  roles: Role[];
  resources: ResourcePermission[];
}

export interface BackendPermissionsResponse {
  success: boolean;
  data: PermissionsData;
}

