/**
 * Entidades para generar contraseña
 */

export interface GeneratePasswordParams {
  token: string;
  user_id?: number; // Opcional: si es super admin puede generar para otro usuario
}

export interface GeneratePasswordResponse {
  success: boolean;
  email: string;
  password: string;
  message: string;
}

