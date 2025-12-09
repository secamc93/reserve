/**
 * Caso de uso: Eliminar Resource (Módulo)
 */

import { IResourcesRepository, DeleteResourceParams } from '../../domain/ports/resources/resources.repository';

export type DeleteResourceInput = DeleteResourceParams;

export class DeleteResourceUseCase {
  constructor(private readonly resourcesRepository: IResourcesRepository) {}

  async execute(input: DeleteResourceInput): Promise<void> {
    await this.resourcesRepository.deleteResource(input);
  }
}

