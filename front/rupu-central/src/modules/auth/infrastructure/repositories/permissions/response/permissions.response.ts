/**
 * Interfaces de respuesta del backend para permisos
 */

export interface BackendPermission {
  id: number;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  scope_id: number;
  scope_name: string;
  scope_code: string;
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
