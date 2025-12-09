/**
 * Entidad de dominio: Resource (Recurso/Módulo)
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

export interface GetResourcesParams {
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  description?: string;
  business_type_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateResourceParams {
  token: string;
  name: string;
  description: string;
  business_type_id?: number;
}

export interface CreateResourceResponse {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateResourceParams {
  token: string;
  id: number;
  name: string;
  description: string;
  business_type_id?: number | null;
}

export interface UpdateResourceResponse {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteResourceParams {
  token: string;
  id: number;
}

export interface DeleteResourceResponse {
  success: boolean;
  message: string;
}
