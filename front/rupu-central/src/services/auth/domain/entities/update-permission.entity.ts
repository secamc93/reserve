/**
 * Entidades para la actualización de permisos
 */

export interface UpdatePermissionParams {
  id: number;
  token: string;
  name: string;
  description?: string;
  resource_id: number;
  action_id: number;
  scope_id: number;
  business_type_id?: number;
}

export interface UpdatePermissionResponse {
  success: boolean;
  message: string;
}

