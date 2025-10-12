import { IPropertyUnitsRepository, UpdatePropertyUnitParams, PropertyUnit } from '../../domain';

export class UpdatePropertyUnitUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: UpdatePropertyUnitParams): Promise<PropertyUnit> {
    return await this.repository.updatePropertyUnit(params);
  }
}
