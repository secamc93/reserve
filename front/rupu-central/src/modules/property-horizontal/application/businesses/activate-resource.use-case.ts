/**
 * Caso de uso: Activar un recurso configurado
 */

import { IBusinessConfiguredResourcesRepository, ActivateResourceParams } from '../../domain/ports';

export class ActivateResourceUseCase {
  constructor(private readonly configuredResourcesRepository: IBusinessConfiguredResourcesRepository) {}

  async execute(params: ActivateResourceParams): Promise<void> {
    return await this.configuredResourcesRepository.activateResource(params);
  }
}

