/**
 * Entidad Resource (Módulo/Recurso del sistema)
 */

export interface Resource {
  id: number;
  name: string;
  description: string;
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

