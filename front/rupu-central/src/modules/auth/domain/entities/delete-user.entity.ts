/**
 * Entidades para la eliminación de usuarios
 */

export interface DeleteUserParams {
  id: number;
  token: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

