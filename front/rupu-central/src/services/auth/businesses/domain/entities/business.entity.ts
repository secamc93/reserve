/**
 * Entidad de dominio: Business (Negocio)
 */

export interface Business {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  navbar_image_url?: string;
  is_active: boolean;
  business_type_id: number;
  business_type?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessesPaginated {
  data: Business[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

