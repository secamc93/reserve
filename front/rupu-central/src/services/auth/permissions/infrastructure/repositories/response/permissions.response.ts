/**
 * Interfaces de respuesta del backend para Permissions
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

export interface BackendGetPermissionByIdResponse {
  success: boolean;
  data: BackendPermission;
}

export interface BackendCreatePermissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    description: string;
    resource_id: number;
    action_id: number;
    scope_id: number;
    business_type_id?: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export interface BackendUpdatePermissionResponse {
  success: boolean;
  message: string;
}

export interface BackendDeletePermissionResponse {
  success: boolean;
  message: string;
}

export interface BackendRole {
  id: number;
  name: string;
  description: string;
}

export interface BackendResourcePermission {
  resource: string;
  actions: string[];
  active: boolean;
}

export interface BackendPermissionsData {
  is_super: boolean;
  business_id: number;
  business_name: string;
  business_type_id: number;
  business_type_name: string;
  role: BackendRole;
  resources: BackendResourcePermission[];
}

export interface BackendPermissionsResponse {
  success: boolean;
  data: BackendPermissionsData;
}
