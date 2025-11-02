/**
 * Interfaces para la respuesta del backend - Login
 * Mapea la estructura exacta que devuelve el API
 */

export interface BusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
}

export interface Business {
  id: number;
  name: string;
  code: string;
  business_type_id: number;
  business_type: BusinessType;
  timezone: string;
  address: string;
  description: string;
  logo_url: string;
  primary_color: string;      // Color principal del negocio
  secondary_color: string;    // Color secundario del negocio
  tertiary_color: string;     // Color terciario del negocio
  quaternary_color: string;   // Color cuaternario del negocio
  navbar_image_url: string;
  custom_domain: string;
  is_active: boolean;
  enable_delivery: boolean;
  enable_pickup: boolean;
  enable_reservations: boolean;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  last_login_at: string;
}

export interface BackendLoginData {
  user: BackendUser;
  token: string;
  require_password_change: boolean;
  businesses: Business[];
  scope: string;
  is_super_admin: boolean;
}

export interface BackendLoginResponse {
  success: boolean;
  data: BackendLoginData;
}

