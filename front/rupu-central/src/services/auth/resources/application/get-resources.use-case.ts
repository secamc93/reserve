/**
 * Caso de uso: Obtener Resources (Módulos)
 */

import { IResourcesRepository } from '../domain/ports';
import { GetResourcesParams, ResourcesList } from '../../domain/entities';

export class GetResourcesUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(params: GetResourcesParams): Promise<ResourcesList> {
    return await this.resourcesRepository.getResources(params);
  }
}
