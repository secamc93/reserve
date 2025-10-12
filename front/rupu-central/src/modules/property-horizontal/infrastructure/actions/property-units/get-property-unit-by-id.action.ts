'use server';

import { PropertyUnitsRepository } from '../../repositories/property-units.repository';
import { GetPropertyUnitByIdUseCase } from '../../../application';
import { GetPropertyUnitByIdParams, PropertyUnit } from '../../../domain';

export async function getPropertyUnitByIdAction(params: GetPropertyUnitByIdParams): Promise<PropertyUnit> {
  const repository = new PropertyUnitsRepository();
  const useCase = new GetPropertyUnitByIdUseCase(repository);
  return await useCase.execute(params);
}
