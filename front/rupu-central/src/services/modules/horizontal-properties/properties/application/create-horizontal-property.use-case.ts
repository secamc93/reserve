/**
 * Caso de uso: Crear propiedad horizontal
 */

import { 
  IHorizontalPropertiesRepository, 
  CreateHorizontalPropertyParams 
} from '../domain/ports/horizontal-properties.repository';
import { HorizontalProperty } from '../domain/entities';

export interface CreateHorizontalPropertyOutput {
  property: HorizontalProperty;
}

export class CreateHorizontalPropertyUseCase {
  constructor(private readonly horizontalPropertiesRepository: IHorizontalPropertiesRepository) {}

  async execute(input: CreateHorizontalPropertyParams): Promise<CreateHorizontalPropertyOutput> {
    const property = await this.horizontalPropertiesRepository.createHorizontalProperty(input);
    return { property };
  }
}

