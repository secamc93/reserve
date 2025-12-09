/**
 * Caso de uso: Eliminar Resource (Módulo)
 */

import { IResourcesRepository } from '../domain/ports';
import { DeleteResourceParams, DeleteResourceResponse } from '../../domain/entities';

export class DeleteResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(params: DeleteResourceParams): Promise<DeleteResourceResponse> {
    return await this.resourcesRepository.deleteResource(params);
  }
}
