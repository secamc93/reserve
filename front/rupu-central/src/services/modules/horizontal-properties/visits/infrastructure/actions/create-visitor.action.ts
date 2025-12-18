'use server';

import { VisitsRepository } from '../repositories';
import { CreateVisitorUseCase } from '../../application';
import { CreateVisitorParams, Visitor } from '../../domain';

export async function createVisitorAction(params: CreateVisitorParams): Promise<Visitor> {
  const repository = new VisitsRepository();
  const useCase = new CreateVisitorUseCase(repository);
  return await useCase.execute(params);
}
