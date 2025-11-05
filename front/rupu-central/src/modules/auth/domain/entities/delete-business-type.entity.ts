/**
 * Entidad de dominio: Delete Business Type
 */

export interface DeleteBusinessTypeInput {
  id: number;
}

export interface DeleteBusinessTypeResult {
  success: boolean;
  message?: string;
  error?: string;
}
