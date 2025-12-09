/**
 * Caso de uso: Obtener lista de propiedades horizontales
 */

import { 
  IHorizontalPropertiesRepository, 
  GetHorizontalPropertiesParams 
} from '../domain/ports/horizontal-properties.repository';
import { HorizontalPropertiesPaginated } from '../domain/entities/horizontal-property.entity';

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

