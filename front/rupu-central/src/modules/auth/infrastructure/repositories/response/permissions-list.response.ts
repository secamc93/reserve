/**
 * Interfaces para la respuesta del backend - Permissions List
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

export interface BackendPermissionsListResponse {
  success: boolean;
  data: BackendPermission[];
  total: number;
}

