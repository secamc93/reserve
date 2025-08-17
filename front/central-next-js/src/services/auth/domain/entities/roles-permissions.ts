/**
 * Entidades del dominio para roles y permisos
 * Estas son las interfaces que se usan en el dominio (camelCase)
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
  resourceName: string;      // ← camelCase del dominio
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
  isSuper: boolean;          // ← camelCase del dominio
  roles: LoginRole[];
  resources: LoginResource[];
}

export interface RolesPermissionsResponse {
  success: boolean;
  data?: RolesPermissionsData;
  message?: string;
} 