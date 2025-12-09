/**
 * Caso de uso: Crear Resource (Módulo)
 */

import { IResourcesRepository, CreateResourceParams } from '../../domain/ports/resources/resources.repository';
import { Resource } from '../../domain/entities/resource.entity';

export type CreateResourceInput = CreateResourceParams;

export interface CreateResourceOutput {
  resource: Resource;
}

export class CreateResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(input: CreateResourceInput): Promise<CreateResourceOutput> {
    const resource = await this.resourcesRepository.createResource(input);
    return {
      resource,
    };
  }
}

