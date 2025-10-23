/**
 * Entidades para la actualización de permisos
 */

export interface UpdatePermissionParams {
  id: number;
  token: string;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  scope_id: number;
}

export interface UpdatePermissionResponse {
  success: boolean;
  message: string;
}
