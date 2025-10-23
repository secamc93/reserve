/**
 * Entidades para obtener un usuario por ID
 */

export interface GetUserByIdParams {
  id: number;
  token: string;
}

export interface GetUserByIdResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
    level: number;
    is_system: boolean;
    scope_id: number;
  }>;
  businesses: Array<{
    id: number;
    name: string;
    logo_url: string;
    business_type_id: number;
    business_type_name: string;
  }>;
}
