/**
 * Interfaces de respuesta del backend para permisos
 */

export interface BackendPermission {
  id: number;
  name: string;
  description: string;
  resource: string;
  resource_id: number;
  action: string;
  action_id: number;
  scope_id: number;
  scope_name: string;
  scope_code: string;
  business_type_id?: number;
  business_type_name?: string;
}

export interface BackendGetPermissionByIdResponse {
  success: boolean;
  data: BackendPermission;
}

export interface BackendDeletePermissionResponse {
  success: boolean;
  message: string;
}

export interface BackendUpdatePermissionResponse {
  success: boolean;
  message: string;
}
