'use server';

import { PropertyUnitsRepository } from '../../repositories/property-units.repository';
import { DeletePropertyUnitUseCase } from '../../../application';
import { DeletePropertyUnitParams } from '../../../domain';

export async function deletePropertyUnitAction(params: DeletePropertyUnitParams): Promise<void> {
  const repository = new PropertyUnitsRepository();
  const useCase = new DeletePropertyUnitUseCase(repository);
  return await useCase.execute(params);
}
