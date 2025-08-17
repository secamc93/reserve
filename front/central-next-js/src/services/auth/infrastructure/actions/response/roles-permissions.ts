/**
 * Interfaces de respuesta del backend para roles y permisos
 * Estas son las interfaces que representan la respuesta real del backend (snake_case)
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
  resource_name: string;      // ← snake_case del backend
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
  is_super: boolean;          // ← snake_case del backend
  roles: LoginRole[];
  resources: LoginResource[];
}

export interface RolesPermissionsResponse {
  success: boolean;
  data?: RolesPermissionsData;
  message?: string;
} 