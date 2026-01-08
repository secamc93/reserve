'use server';

import { VisitsRepository } from '../repositories';
import { GetVisitByIdUseCase } from '../../application';
import { GetVisitByIdParams, Visit } from '../../domain';

export async function getVisitByIdAction(params: GetVisitByIdParams): Promise<Visit> {
  const repository = new VisitsRepository();
  const useCase = new GetVisitByIdUseCase(repository);
  return await useCase.execute(params);
}
