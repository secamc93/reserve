import { IPropertyUnitsRepository, GetPropertyUnitsSummaryParams, PropertyUnitsSummary } from '../domain';

export class GetPropertyUnitsSummaryUseCase {
  constructor(private repository: IPropertyUnitsRepository) {}

  async execute(params: GetPropertyUnitsSummaryParams): Promise<PropertyUnitsSummary> {
    return await this.repository.getPropertyUnitsSummary(params);
  }
}
