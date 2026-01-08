'use server';

import { VisitsRepository } from '../repositories';
import { RegisterAssetsUseCase } from '../../application';
import { RegisterAssetsParams } from '../../domain';

export async function registerAssetsAction(params: RegisterAssetsParams): Promise<void> {
  const repository = new VisitsRepository();
  const useCase = new RegisterAssetsUseCase(repository);
  return await useCase.execute(params);
}
