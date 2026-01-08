'use server';

import { VisitsRepository } from '../repositories';
import { GetVisitTypesUseCase } from '../../application';
import { GetVisitTypesParams, VisitType } from '../../domain';

export async function getVisitTypesAction(params: GetVisitTypesParams): Promise<VisitType[]> {
  const repository = new VisitsRepository();
  const useCase = new GetVisitTypesUseCase(repository);
  return await useCase.execute(params);
}
