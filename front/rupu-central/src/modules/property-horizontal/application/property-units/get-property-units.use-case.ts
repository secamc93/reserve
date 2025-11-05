import { IPropertyUnitsRepository, GetPropertyUnitsParams, PropertyUnitsPaginated } from '../../domain';

export class GetPropertyUnitsUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: GetPropertyUnitsParams): Promise<PropertyUnitsPaginated> {
    return await this.repository.getPropertyUnits(params);
  }
}
