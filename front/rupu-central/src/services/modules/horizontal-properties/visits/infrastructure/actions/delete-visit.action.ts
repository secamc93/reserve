'use server';

import { VisitsRepository } from '../repositories';
import { DeleteVisitUseCase } from '../../application';
import { DeleteVisitParams } from '../../domain';

export async function deleteVisitAction(params: DeleteVisitParams): Promise<void> {
  const repository = new VisitsRepository();
  const useCase = new DeleteVisitUseCase(repository);
  return await useCase.execute(params);
}
