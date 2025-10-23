/**
 * Interfaces de respuesta del backend para usuarios
 */

export interface BackendUserRole {
  id: number;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
}

export interface BackendUserBusiness {
  id: number;
  name: string;
  logo_url: string;
  business_type_id: number;
  business_type_name: string;
}

export interface BackendUserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: BackendUserRole[];
  businesses: BackendUserBusiness[];
}

export interface BackendUsersListResponse {
  success: boolean;
  data: {
    users: BackendUserDetail[];
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface BackendCreateUserResponse {
  success: boolean;
  data: BackendUserDetail;
}

export interface BackendDeleteUserResponse {
  success: boolean;
  message: string;
}

export interface BackendUpdateUserResponse {
  success: boolean;
  data: BackendUserDetail;
}

export interface BackendGetUserByIdResponse {
  success: boolean;
  data: BackendUserDetail;
}

