'use server';

import { VisitsRepository } from '../repositories';
import { DeleteCompanionUseCase } from '../../application';
import { DeleteCompanionParams } from '../../domain';

export async function deleteCompanionAction(params: DeleteCompanionParams): Promise<void> {
  const repository = new VisitsRepository();
  const useCase = new DeleteCompanionUseCase(repository);
  return await useCase.execute(params);
}
