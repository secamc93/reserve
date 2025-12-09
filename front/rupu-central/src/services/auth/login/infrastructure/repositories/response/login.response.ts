/**
 * Interfaces de respuesta del backend para Login
 */

export interface BackendUserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface BackendBusinessTypeInfo {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

export interface BackendBusinessInfo {
  id: number;
  name: string;
  code: string;
  business_type_id: number;
  business_type: BackendBusinessTypeInfo;
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

export interface BackendLoginResponseData {
  user: BackendUserInfo;
  token: string;
  require_password_change: boolean;
  businesses: BackendBusinessInfo[];
  scope: string;
  is_super_admin: boolean;
}

export interface BackendLoginResponse {
  success: boolean;
  data: BackendLoginResponseData;
}

export interface BackendLoginErrorResponse {
  error: string;
  details?: string;
}
