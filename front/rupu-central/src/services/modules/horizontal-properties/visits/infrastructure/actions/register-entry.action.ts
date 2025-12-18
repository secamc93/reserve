'use server';

import { VisitsRepository } from '../repositories';
import { RegisterEntryUseCase } from '../../application';
import { RegisterEntryParams, Visit } from '../../domain';

export async function registerEntryAction(params: RegisterEntryParams): Promise<Visit> {
  const repository = new VisitsRepository();
  const useCase = new RegisterEntryUseCase(repository);
  return await useCase.execute(params);
}
