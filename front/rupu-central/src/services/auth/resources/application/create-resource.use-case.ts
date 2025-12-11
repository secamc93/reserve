/**
 * Caso de uso: Crear Resource (Módulo)
 */

import { IResourcesRepository } from '../domain/ports';
import { CreateResourceParams, CreateResourceResponse } from '../domain/entities';

export class CreateResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(params: CreateResourceParams): Promise<CreateResourceResponse> {
    return await this.resourcesRepository.createResource(params);
  }
}
