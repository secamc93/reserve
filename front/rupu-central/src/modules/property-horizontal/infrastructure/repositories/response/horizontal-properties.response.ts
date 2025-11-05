/**
 * Interfaces de respuesta del backend para Propiedades Horizontales
 */

export interface BackendHorizontalProperty {
  id: number;
  name: string;
  code: string;
  business_type_name: string;
  business_type_id?: number;
  address: string;
  total_units: number;
  is_active: boolean;
  created_at: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  navbar_image_url?: string;
  custom_domain?: string;
  has_elevator?: boolean;
  has_parking?: boolean;
  has_pool?: boolean;
  has_gym?: boolean;
  has_social_area?: boolean;
  total_floors?: number;
  timezone?: string;
  updated_at?: string;
  property_units?: unknown[];
  committees?: unknown[];
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

export interface BackendGetHorizontalPropertyByIdResponse {
  success: boolean;
  message: string;
  data: BackendHorizontalProperty;
}

export interface BackendCreateHorizontalPropertyResponse {
  success: boolean;
  message: string;
  data: BackendHorizontalProperty;
}

