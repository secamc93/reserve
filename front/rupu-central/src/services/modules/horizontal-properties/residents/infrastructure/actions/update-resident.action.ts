'use server';

import { ResidentsRepository } from '../repositories';
import { UpdateResidentUseCase } from '../../application';
import { UpdateResidentParams, Resident } from '../../domain';

export async function updateResidentAction(params: UpdateResidentParams): Promise<Resident> {
  const repository = new ResidentsRepository();
  const useCase = new UpdateResidentUseCase(repository);
  return await useCase.execute(params);
}
