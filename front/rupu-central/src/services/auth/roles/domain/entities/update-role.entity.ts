/**
 * Entidad de dominio: Actualizar Rol
 */

export interface UpdateRoleInput {
  id: number;
  name?: string;
  description?: string;
  level?: number;
  is_system?: boolean;
  scope_id?: number;
  business_type_id?: number;
}

export interface UpdateRoleOutput {
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

export interface UpdateRoleResult {
  success: boolean;
  data?: UpdateRoleOutput;
  error?: string;
}

