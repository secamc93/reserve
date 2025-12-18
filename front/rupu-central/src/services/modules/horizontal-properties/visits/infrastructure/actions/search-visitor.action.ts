'use server';

import { VisitsRepository } from '../repositories';
import { SearchVisitorUseCase } from '../../application';
import { SearchVisitorParams, Visitor } from '../../domain';

export async function searchVisitorAction(params: SearchVisitorParams): Promise<Visitor> {
  const repository = new VisitsRepository();
  const useCase = new SearchVisitorUseCase(repository);
  return await useCase.execute(params);
}
