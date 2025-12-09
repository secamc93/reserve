/**
 * Entidades para la eliminación de permisos
 */

export interface DeletePermissionParams {
  id: number;
  token: string;
}

export interface DeletePermissionResponse {
  success: boolean;
  message: string;
}
