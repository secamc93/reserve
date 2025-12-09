/**
 * Entidad de dominio: Obtener Permisos de un Rol
 */

export interface GetRolePermissionsInput {
  role_id: number;
}

export interface RolePermission {
  id: number;
  resource: string;
  action: string;
  description: string;
  scope_id: number;
  scope_name: string;
  scope_code: string;
}

export interface GetRolePermissionsOutput {
  role_id: number;
  role_name: string;
  permissions: RolePermission[];
  count: number;
}

export interface GetRolePermissionsResult {
  success: boolean;
  data?: GetRolePermissionsOutput;
  error?: string;
}

