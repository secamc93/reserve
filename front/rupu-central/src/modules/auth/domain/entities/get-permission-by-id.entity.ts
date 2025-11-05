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
  code: string;
  description: string;
  resource: string;
  action: string;
  scope_id: number;
  scope_name: string;
  scope_code: string;
}

