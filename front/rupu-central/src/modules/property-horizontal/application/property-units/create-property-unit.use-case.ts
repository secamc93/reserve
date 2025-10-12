import { IPropertyUnitsRepository, CreatePropertyUnitParams, PropertyUnit } from '../../domain';

export class CreatePropertyUnitUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: CreatePropertyUnitParams): Promise<PropertyUnit> {
    return await this.repository.createPropertyUnit(params);
  }
}
