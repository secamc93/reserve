/**
 * Interfaces de request del backend para permisos
 */

export interface BackendUpdatePermissionRequest {
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  scope_id: number;
}
