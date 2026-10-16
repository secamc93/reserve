'use server';

import { ResidentsRepository } from '../repositories';
import { GetResidentsSummaryUseCase } from '../../application';
import { GetResidentsSummaryParams, ResidentsSummary } from '../../domain';

export async function getResidentsSummaryAction(params: GetResidentsSummaryParams): Promise<ResidentsSummary> {
  const repository = new ResidentsRepository();
  const useCase = new GetResidentsSummaryUseCase(repository);
  return await useCase.execute(params);
}
