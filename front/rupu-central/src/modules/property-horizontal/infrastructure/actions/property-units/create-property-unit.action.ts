'use server';

import { PropertyUnitsRepository } from '../../repositories/property-units.repository';
import { CreatePropertyUnitUseCase } from '../../../application';
import { CreatePropertyUnitParams, PropertyUnit } from '../../../domain';

export async function createPropertyUnitAction(params: CreatePropertyUnitParams): Promise<PropertyUnit> {
  const repository = new PropertyUnitsRepository();
  const useCase = new CreatePropertyUnitUseCase(repository);
  return await useCase.execute(params);
}
