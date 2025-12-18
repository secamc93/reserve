'use server';

import { VisitsRepository } from '../repositories';
import { RegisterExitUseCase } from '../../application';
import { RegisterExitParams, Visit } from '../../domain';

export async function registerExitAction(params: RegisterExitParams): Promise<Visit> {
  const repository = new VisitsRepository();
  const useCase = new RegisterExitUseCase(repository);
  return await useCase.execute(params);
}
