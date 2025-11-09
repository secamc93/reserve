/**
 * Entidades para obtener un permiso por ID
 */

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

