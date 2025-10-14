/**
 * Caso de uso: Eliminar Propiedad Horizontal
 */

import { IHorizontalPropertiesRepository, DeleteHorizontalPropertyParams } from '../../domain/ports/horizontal-properties.repository';

export type DeleteHorizontalPropertyInput = DeleteHorizontalPropertyParams;

export class DeleteHorizontalPropertyUseCase {
  constructor(private readonly repository: IHorizontalPropertiesRepository) {}

  async execute(input: DeleteHorizontalPropertyInput): Promise<void> {
    return this.repository.deleteHorizontalProperty(input);
  }
}

