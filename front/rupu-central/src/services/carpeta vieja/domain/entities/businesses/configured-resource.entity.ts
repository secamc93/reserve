/**
 * Entidad de dominio: Configured Resource (Recurso Configurado)
 */

export interface ConfiguredResource {
  resource_id: number;
  resource_name: string;
  is_active: boolean;
}

export interface BusinessConfiguredResources {
  id: number;
  name: string;
  code: string;
  resources: ConfiguredResource[];
  created_at: string;
  updated_at: string;
}

