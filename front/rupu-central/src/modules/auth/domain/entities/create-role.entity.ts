/**
 * Entidad de dominio: Crear Rol
 */

export interface CreateRoleInput {
  name: string;
  description: string;
  level: number;
  is_system?: boolean;
  scope_id: number;
  business_type_id: number;
}

export interface CreateRoleOutput {
  id: number;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
  business_type_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleResult {
  success: boolean;
  data?: CreateRoleOutput;
  error?: string;
}
