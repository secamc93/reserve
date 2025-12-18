'use server';

import { VisitsRepository } from '../repositories';
import { GetVisitsUseCase } from '../../application';
import { GetVisitsParams, VisitsPaginated } from '../../domain';

export async function getVisitsAction(params: GetVisitsParams): Promise<VisitsPaginated> {
  const repository = new VisitsRepository();
  const useCase = new GetVisitsUseCase(repository);
  return await useCase.execute(params);
}
