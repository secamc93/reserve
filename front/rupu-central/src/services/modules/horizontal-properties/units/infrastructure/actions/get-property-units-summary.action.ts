'use server';

import { PropertyUnitsRepository } from '../repositories';
import { GetPropertyUnitsSummaryUseCase } from '../../application';
import { GetPropertyUnitsSummaryParams, PropertyUnitsSummary } from '../../domain';

export async function getPropertyUnitsSummaryAction(params: GetPropertyUnitsSummaryParams): Promise<PropertyUnitsSummary> {
  const repository = new PropertyUnitsRepository();
  const useCase = new GetPropertyUnitsSummaryUseCase(repository);
  return await useCase.execute(params);
}
