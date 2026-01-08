'use server';

import { VisitsRepository } from '../repositories';
import { UpdateVisitUseCase } from '../../application';
import { UpdateVisitParams, Visit } from '../../domain';

export async function updateVisitAction(params: UpdateVisitParams): Promise<Visit> {
  const repository = new VisitsRepository();
  const useCase = new UpdateVisitUseCase(repository);
  return await useCase.execute(params);
}
