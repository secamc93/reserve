import { IPropertyUnitsRepository, GetPropertyUnitByIdParams, PropertyUnit } from '../../domain';

export class GetPropertyUnitByIdUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: GetPropertyUnitByIdParams): Promise<PropertyUnit> {
    return await this.repository.getPropertyUnitById(params);
  }
}
