/**
 * Interfaces de respuesta del backend para Configured Resources
 */

export interface BackendConfiguredResource {
  resource_id: number;
  resource_name: string;
  is_active: boolean;
}

export interface BackendBusinessConfiguredResourcesResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    code: string;
    resources: BackendConfiguredResource[];
    created_at: string;
    updated_at: string;
  };
}

