/**
 * Interfaces para la respuesta del backend - Permissions List
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

export interface BackendPermissionsListResponse {
  success: boolean;
  data: BackendPermission[];
  total: number;
}

