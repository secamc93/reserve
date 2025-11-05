/**
 * Entidad de dominio: Business Type
 */

export interface BusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessTypesList {
  businessTypes: BusinessType[];
  count: number;
}

export interface GetBusinessTypesResult {
  success: boolean;
  data?: BusinessTypesList;
  error?: string;
}
