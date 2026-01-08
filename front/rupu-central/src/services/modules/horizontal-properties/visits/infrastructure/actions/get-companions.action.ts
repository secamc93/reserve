'use server';

import { VisitsRepository } from '../repositories';
import { GetCompanionsUseCase } from '../../application';
import { GetCompanionsParams, VisitCompanion } from '../../domain';

export async function getCompanionsAction(params: GetCompanionsParams): Promise<VisitCompanion[]> {
  const repository = new VisitsRepository();
  const useCase = new GetCompanionsUseCase(repository);
  return await useCase.execute(params);
}
