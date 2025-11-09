/**
 * Interfaces de request del backend para permisos
 */

export interface BackendUpdatePermissionRequest {
  name: string;
  description?: string;
  resource_id: number;
  action_id: number;
  scope_id: number;
  business_type_id?: number;
}
