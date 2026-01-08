'use server';

import { VisitsRepository } from '../repositories';
import { GetVisitStatusesUseCase } from '../../application';
import { GetVisitStatusesParams, VisitStatus } from '../../domain';

export async function getVisitStatusesAction(params: GetVisitStatusesParams): Promise<VisitStatus[]> {
  const repository = new VisitsRepository();
  const useCase = new GetVisitStatusesUseCase(repository);
  return await useCase.execute(params);
}
