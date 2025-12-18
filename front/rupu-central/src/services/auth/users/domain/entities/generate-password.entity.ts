/**
 * Entidades del dominio para Generar Contraseña
 */

export interface GeneratePasswordParams {
  token: string;
  user_id: number;
}

export interface GeneratePasswordResponse {
  success: boolean;
  email: string;
  password: string;
  message?: string;
  error?: string;
}


