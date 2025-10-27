/**
 * Puerto para el repositorio de recursos
 */

import { Resource, ResourcesList } from '../../entities/resource.entity';

export interface GetResourcesParams {
  page?: number;
  pageSize?: number;
  name?: string;
  description?: string;
  business_type_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  token: string;
}

export interface CreateResourceParams {
  name: string;
  description: string;
  business_type_id?: number;
  token: string;
}

export interface DeleteResourceParams {
  id: number;
  token: string;
}

export interface UpdateResourceParams {
  id: number;
  name: string;
  description: string;
  business_type_id?: number | null;
  token: string;
}

export interface IResourcesRepository {
  getResources(params: GetResourcesParams): Promise<ResourcesList>;
  createResource(params: CreateResourceParams): Promise<Resource>;
  updateResource(params: UpdateResourceParams): Promise<Resource>;
  deleteResource(params: DeleteResourceParams): Promise<void>;
}

