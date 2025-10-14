/**
 * Caso de uso: Obtener Resources (Módulos)
 */

import { IResourcesRepository, GetResourcesParams } from '../domain/ports/resources.repository';
import { ResourcesList } from '../domain/entities/resource.entity';

export type GetResourcesInput = GetResourcesParams;

export interface GetResourcesOutput {
  resources: ResourcesList;
}

export class GetResourcesUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(input: GetResourcesInput): Promise<GetResourcesOutput> {
    const resources = await this.resourcesRepository.getResources(input);
    return {
      resources,
    };
  }
}

