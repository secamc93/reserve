/**
 * Entidades del dominio para Cambio de Contraseña
 */

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}


