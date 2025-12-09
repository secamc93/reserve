/**
 * Entidad de dominio: Update Business Type
 */

export interface UpdateBusinessTypeInput {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export interface UpdateBusinessTypeResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}
