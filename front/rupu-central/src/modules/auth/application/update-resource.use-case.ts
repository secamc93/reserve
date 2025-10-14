/**
 * Caso de uso: Actualizar Resource (Módulo)
 */

import { IResourcesRepository, UpdateResourceParams } from '../domain/ports/resources.repository';
import { Resource } from '../domain/entities/resource.entity';

export type UpdateResourceInput = UpdateResourceParams;

export interface UpdateResourceOutput {
  resource: Resource;
}

export class UpdateResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(input: UpdateResourceInput): Promise<UpdateResourceOutput> {
    const resource = await this.resourcesRepository.updateResource(input);
    return {
      resource,
    };
  }
}

