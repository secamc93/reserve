/**
 * Puerto de dominio: Repositorio de Resources
 */

import {
  ResourcesList,
  GetResourcesParams,
  CreateResourceParams,
  CreateResourceResponse,
  UpdateResourceParams,
  UpdateResourceResponse,
  DeleteResourceParams,
  DeleteResourceResponse,
} from '../entities/resource.entity';

export interface IResourcesRepository {
  getResources(params: GetResourcesParams): Promise<ResourcesList>;
  createResource(params: CreateResourceParams): Promise<CreateResourceResponse>;
  updateResource(params: UpdateResourceParams): Promise<UpdateResourceResponse>;
  deleteResource(params: DeleteResourceParams): Promise<DeleteResourceResponse>;
}
