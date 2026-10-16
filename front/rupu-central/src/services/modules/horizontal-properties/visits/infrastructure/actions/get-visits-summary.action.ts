'use server';

import { VisitsRepository } from '../repositories';
import { GetVisitsSummaryUseCase } from '../../application';
import { GetVisitsSummaryParams, VisitsSummary } from '../../domain';

export async function getVisitsSummaryAction(params: GetVisitsSummaryParams): Promise<VisitsSummary> {
  const repository = new VisitsRepository();
  const useCase = new GetVisitsSummaryUseCase(repository);
  return await useCase.execute(params);
}
