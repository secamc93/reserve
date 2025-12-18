'use server';

import { VisitsRepository } from '../repositories';
import { CreateVisitUseCase } from '../../application';
import { CreateVisitParams, Visit } from '../../domain';

export async function createVisitAction(params: CreateVisitParams): Promise<Visit> {
  const repository = new VisitsRepository();
  const useCase = new CreateVisitUseCase(repository);
  return await useCase.execute(params);
}
