/**
 * Interfaces de respuesta del backend para Propiedades Horizontales
 */

export interface BackendHorizontalProperty {
  id: number;
  name: string;
  code: string;
  business_type_name: string;
  address: string;
  total_units: number;
  is_active: boolean;
  created_at: string;
}

export interface BackendHorizontalPropertiesResponse {
  success: boolean;
  message: string;
  data: {
    data: BackendHorizontalProperty[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

