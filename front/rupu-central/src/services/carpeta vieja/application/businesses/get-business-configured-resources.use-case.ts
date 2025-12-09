/**
 * Caso de uso: Obtener recursos configurados de un business
 */

import { IBusinessConfiguredResourcesRepository, GetBusinessConfiguredResourcesParams } from '../../domain/ports';
import { BusinessConfiguredResources } from '../../domain/entities';

export class GetBusinessConfiguredResourcesUseCase {
  constructor(private readonly configuredResourcesRepository: IBusinessConfiguredResourcesRepository) {}

  async execute(params: GetBusinessConfiguredResourcesParams): Promise<BusinessConfiguredResources> {
    return await this.configuredResourcesRepository.getBusinessConfiguredResources(params);
  }
}

