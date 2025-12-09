'use server';

import { ResidentsRepository } from '../repositories';
import { DeleteResidentUseCase } from '../../application';
import { DeleteResidentParams } from '../../domain';

export async function deleteResidentAction(params: DeleteResidentParams): Promise<void> {
  const repository = new ResidentsRepository();
  const useCase = new DeleteResidentUseCase(repository);
  return await useCase.execute(params);
}
