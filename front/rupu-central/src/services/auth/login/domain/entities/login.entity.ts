/**
 * Entidades del dominio para Login
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface BusinessTypeInfo {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

export interface BusinessInfo {
  id: number;
  name: string;
  code: string;
  business_type_id: number;
  business_type: BusinessTypeInfo;
  timezone?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  navbar_image_url?: string;
  custom_domain?: string;
  is_active: boolean;
  enable_delivery?: boolean;
  enable_pickup?: boolean;
  enable_reservations?: boolean;
}

export interface LoginResponse {
  user: UserInfo;
  token: string;
  require_password_change: boolean;
  businesses: BusinessInfo[];
  scope: string; // 'platform' | 'business'
  is_super_admin: boolean;
}
