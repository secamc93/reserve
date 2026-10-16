'use server';

import { ResidentsRepository } from '../repositories';
import { GetResidentOverviewUseCase } from '../../application';
import { GetResidentByIdParams, ResidentOverview } from '../../domain';

export async function getResidentOverviewAction(params: GetResidentByIdParams): Promise<ResidentOverview> {
  const repository = new ResidentsRepository();
  const useCase = new GetResidentOverviewUseCase(repository);
  return await useCase.execute(params);
}
