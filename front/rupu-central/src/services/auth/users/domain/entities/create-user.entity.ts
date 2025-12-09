/**
 * Entidades para la creación de usuarios
 */

export interface CreateUserParams {
  name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  avatarFile?: File | null;
  business_ids?: string; // IDs separados por comas
  token: string;
}

export interface CreateUserResponse {
  success: boolean;
  email: string;
  password: string;
  message: string;
}

