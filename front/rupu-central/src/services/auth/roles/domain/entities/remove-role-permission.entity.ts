/**
 * Entidad de dominio: Remover Permiso de un Rol
 */

export interface RemoveRolePermissionInput {
  role_id: number;
  permission_id: number;
}

export interface RemoveRolePermissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

