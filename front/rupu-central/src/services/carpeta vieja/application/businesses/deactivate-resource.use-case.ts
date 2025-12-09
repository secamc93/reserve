/**
 * Caso de uso: Desactivar un recurso configurado
 */

import { IBusinessConfiguredResourcesRepository, DeactivateResourceParams } from '../../domain/ports';

export class DeactivateResourceUseCase {
  constructor(private readonly configuredResourcesRepository: IBusinessConfiguredResourcesRepository) {}

  async execute(params: DeactivateResourceParams): Promise<void> {
    return await this.configuredResourcesRepository.deactivateResource(params);
  }
}

