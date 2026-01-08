'use server';

import { VisitsRepository } from '../repositories';
import { CreateCompanionUseCase } from '../../application';
import { CreateCompanionParams, VisitCompanion } from '../../domain';

export async function createCompanionAction(params: CreateCompanionParams): Promise<VisitCompanion> {
  const repository = new VisitsRepository();
  const useCase = new CreateCompanionUseCase(repository);
  return await useCase.execute(params);
}
