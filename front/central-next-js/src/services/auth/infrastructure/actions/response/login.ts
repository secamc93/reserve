/**
 * Interfaces para la respuesta REAL del login
 * Esta es la respuesta que realmente envía el backend
 */

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;        // ← snake_case del backend
  is_active: boolean;        // ← snake_case del backend
  last_login_at: string;
}

export interface LoginBusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
}

export interface LoginBusiness {
  id: number;
  name: string;
  code: string;
  business_type_id: number;
  business_type: LoginBusinessType;
  timezone: string;
  address: string;
  description: string;
  logo_url: string;          // ← snake_case del backend
  primary_color: string;     // ← snake_case del backend
  secondary_color: string;
  tertiary_color: string;
  quaternary_color: string;
  navbar_image_url: string;
  custom_domain: string;
  is_active: boolean;        // ← snake_case del backend
  enable_delivery: boolean;
  enable_pickup: boolean;
  enable_reservations: boolean;
}

export interface LoginData {
  user: LoginUser;
  token: string;
  require_password_change: boolean;
  businesses: LoginBusiness[];
}

export interface LoginResponse {
  success: boolean;
  data?: LoginData;
  message?: string;
}
