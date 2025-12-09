/**
 * Entidad User (Domain)
 * Representa un usuario en el dominio de negocio
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // Los roles vienen del backend de forma dinámica
  avatarUrl?: string; // URL del avatar del usuario
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: string;
}

/**
 * Información de negocio asociado al usuario
 */
export interface BusinessInfo {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  primary_color?: string;      // Color principal del negocio
  secondary_color?: string;    // Color secundario del negocio
  tertiary_color?: string;     // Color terciario del negocio
  quaternary_color?: string;   // Color cuaternario del negocio
}

/**
 * Respuesta del proceso de login
 */
export interface LoginResponse {
  user: User;
  token: string;
  businesses: BusinessInfo[];
  scope: string;
  is_super_admin: boolean;
}

