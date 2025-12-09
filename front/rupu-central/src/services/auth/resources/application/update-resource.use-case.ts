/**
 * Caso de uso: Actualizar Resource (Módulo)
 */

import { IResourcesRepository } from '../domain/ports';
import { UpdateResourceParams, UpdateResourceResponse } from '../../domain/entities';

export class UpdateResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(params: UpdateResourceParams): Promise<UpdateResourceResponse> {
    return await this.resourcesRepository.updateResource(params);
  }
}
