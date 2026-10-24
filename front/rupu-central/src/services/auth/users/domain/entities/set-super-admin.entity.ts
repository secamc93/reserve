/**
 * Entidades para dar o quitar el rol de super admin a un usuario
 */

export interface SetSuperAdminParams {
  token: string;
  user_id: number;
  enabled: boolean;
}

export interface SetSuperAdminResponse {
  success: boolean;
  message: string;
  is_super_admin: boolean;
}
