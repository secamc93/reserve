/**
 * Use Case: Resumen de una propiedad (tarjeta del selector)
 */

import { IHorizontalPropertiesRepository, GetPropertyOverviewParams } from '../domain/ports/horizontal-properties.repository';
import { PropertyOverview } from '../domain/entities';

export class GetPropertyOverviewUseCase {
  constructor(private readonly repository: IHorizontalPropertiesRepository) {}

  async execute(params: GetPropertyOverviewParams): Promise<PropertyOverview> {
    return this.repository.getPropertyOverview(params);
  }
}
