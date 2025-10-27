/**
 * Entidad para crear un permiso
 */

export interface CreatePermissionInput {
  name: string;
  description?: string;
  resource_id: number;
  action_id: number; // Pendiente: implementar lista de acciones
  scope_id: number;
  business_type_id?: number;
}

export interface CreatePermissionResult {
  success: boolean;
  data?: {
    id: number;
    name: string;
    description: string;
    resource_id: number;
    action_id: number;
    scope_id: number;
    business_type_id?: number;
  };
  error?: string;
}

