/**
 * Entidad de dominio: Asignar Permisos a Rol
 */

export interface AssignRolePermissionsInput {
  role_id: number;
  permission_ids: number[];
}

export interface AssignRolePermissionsOutput {
  role_id: number;
  permission_ids: number[];
}

export interface AssignRolePermissionsResult {
  success: boolean;
  data?: AssignRolePermissionsOutput;
  error?: string;
}

