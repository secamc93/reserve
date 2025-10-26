/**
 * Entidades para la creación de usuarios
 */

export interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarFile?: File | null;
  business_ids: string;
  token: string;
}

export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  is_active: boolean;
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

