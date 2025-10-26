/**
 * Entidades para la actualización de usuarios
 */

export interface UpdateUserParams {
  id: number;
  token: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarFile?: File | null;
  is_active?: boolean;
  role_ids?: string; // Comma-separated string of role IDs
  business_ids?: string; // Comma-separated string of business IDs
}

export interface UpdateUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
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

