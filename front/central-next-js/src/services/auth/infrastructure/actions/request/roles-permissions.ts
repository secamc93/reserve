/**
 * Interfaces para la respuesta de roles y permisos
 * Esta es la respuesta que se obtiene de /api/v1/auth/roles-permissions
 */

export interface LoginAction {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
}

export interface LoginResource {
  resource: string;
  resource_name: string;
  actions: LoginAction[];
}

export interface LoginRole {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  scope: string;
}

export interface RolesPermissionsData {
  is_super: boolean;
  roles: LoginRole[];
  resources: LoginResource[];
}

export interface RolesPermissionsResponse {
  success: boolean;
  data?: RolesPermissionsData;
  message?: string;
} 