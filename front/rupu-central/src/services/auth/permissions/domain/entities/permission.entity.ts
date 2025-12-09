/**
 * Entidad de dominio: Permission (Permiso)
 */

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  resourceId: number;
  action: string;
  actionId: number;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export interface PermissionsList {
  permissions: Permission[];
  total: number;
}

export interface GetPermissionsParams {
  token: string;
  business_type_id?: number;
}

export interface CreatePermissionParams {
  token: string;
  name: string;
  description?: string;
  resource_id: number;
  action_id: number;
  scope_id: number;
  business_type_id?: number;
}

export interface CreatePermissionResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    resource_id: number;
    action_id: number;
    scope_id: number;
    business_type_id?: number;
  };
  error?: string;
}

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

export interface DeletePermissionParams {
  id: number;
  token: string;
}

export interface DeletePermissionResponse {
  success: boolean;
  message: string;
}

export interface GetPermissionByIdParams {
  id: number;
  token: string;
}

export interface GetPermissionByIdResponse {
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
