'use server';

import { PropertyUnitsRepository } from '../../repositories/property-units.repository';
import { GetPropertyUnitsUseCase } from '../../../application';
import { GetPropertyUnitsParams, PropertyUnitsPaginated } from '../../../domain';

export async function getPropertyUnitsAction(params: GetPropertyUnitsParams): Promise<PropertyUnitsPaginated> {
  const repository = new PropertyUnitsRepository();
  const useCase = new GetPropertyUnitsUseCase(repository);
  return await useCase.execute(params);
}
