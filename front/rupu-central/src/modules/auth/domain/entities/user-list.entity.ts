/**
 * Entidades para la lista de usuarios
 */

export interface UserRole {
  id: number;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
}

export interface UserBusiness {
  id: number;
  name: string;
  logo_url: string;
  business_type_id: number;
  business_type_name: string;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  is_super_user?: boolean;
  last_login_at?: string;
  roles: UserRole[];
  businesses: UserBusiness[];
  business_role_assignments?: Array<{
    business_id: number;
    business_name?: string;
    role_id: number;
    role_name: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface UsersList {
  users: UserListItem[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GetUsersParams {
  page?: number;
  page_size?: number;
  name?: string;
  email?: string;
  phone?: string;
  user_ids?: string;
  is_active?: boolean;
  role_id?: number;
  business_id?: number;
  created_at?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  token: string;
}
