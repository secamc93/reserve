/**
 * Caso de uso: Obtener lista de businesses
 */

import { IBusinessesRepository, GetBusinessesParams } from '../../domain/ports';
import { BusinessesPaginated } from '../../domain/entities';

export class GetBusinessesUseCase {
  constructor(private readonly businessesRepository: IBusinessesRepository) {}

  async execute(params: GetBusinessesParams): Promise<BusinessesPaginated> {
    return await this.businessesRepository.getBusinesses(params);
  }
}

