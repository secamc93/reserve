/**
 * Caso de uso: Obtener propiedad horizontal por ID
 */

import { 
  IHorizontalPropertiesRepository, 
  GetHorizontalPropertyByIdParams 
} from '../domain/ports/horizontal-properties.repository';
import { HorizontalProperty } from '../domain/entities/horizontal-property.entity';

export interface GetHorizontalPropertyByIdOutput {
  property: HorizontalProperty;
}

export class GetHorizontalPropertyByIdUseCase {
  constructor(private readonly horizontalPropertiesRepository: IHorizontalPropertiesRepository) {}

  async execute(input: GetHorizontalPropertyByIdParams): Promise<GetHorizontalPropertyByIdOutput> {
    const property = await this.horizontalPropertiesRepository.getHorizontalPropertyById(input);
    return { property };
  }
}

