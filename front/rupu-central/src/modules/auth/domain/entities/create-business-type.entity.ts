/**
 * Entidad de dominio: Create Business Type
 */

export interface CreateBusinessTypeInput {
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active?: boolean;
}

export interface CreateBusinessTypeResult {
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
