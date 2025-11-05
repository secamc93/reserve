/**
 * Caso de uso: Obtener lista de propiedades horizontales
 */

import { 
  IHorizontalPropertiesRepository, 
  GetHorizontalPropertiesParams 
} from '../../domain/ports';
import { HorizontalPropertiesPaginated } from '../../domain/entities';

export interface GetHorizontalPropertiesOutput {
  properties: HorizontalPropertiesPaginated;
}

export class GetHorizontalPropertiesUseCase {
  constructor(private readonly horizontalPropertiesRepository: IHorizontalPropertiesRepository) {}

  async execute(input: GetHorizontalPropertiesParams): Promise<GetHorizontalPropertiesOutput> {
    const properties = await this.horizontalPropertiesRepository.getHorizontalProperties(input);
    return { properties };
  }
}

