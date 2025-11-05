/**
 * Entidad Resource (Módulo/Recurso del sistema)
 */

export interface Resource {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourcesList {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

