'use server';

import { PropertyUnitsRepository } from '../../repositories/property-units';
import { UpdatePropertyUnitUseCase } from '../../../application';
import { UpdatePropertyUnitParams, PropertyUnit } from '../../../domain';

export async function updatePropertyUnitAction(params: UpdatePropertyUnitParams): Promise<PropertyUnit> {
  const repository = new PropertyUnitsRepository();
  const useCase = new UpdatePropertyUnitUseCase(repository);
  return await useCase.execute(params);
}
