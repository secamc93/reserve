/**
 * Interfaces para la respuesta del backend - Roles
 * Mapea la estructura de la lista de roles del sistema
 */

export interface RoleData {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
  scope_name: string;
  scope_code: string;
}

export interface BackendRolesResponse {
  success: boolean;
  data: RoleData[];
  count: number;
}

