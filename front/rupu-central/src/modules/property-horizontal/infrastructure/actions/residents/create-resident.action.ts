'use server';

import { ResidentsRepository } from '../../repositories/residents.repository';
import { CreateResidentUseCase } from '../../../application';
import { CreateResidentParams, Resident } from '../../../domain';

export async function createResidentAction(params: CreateResidentParams): Promise<Resident> {
  const repository = new ResidentsRepository();
  const useCase = new CreateResidentUseCase(repository);
  return await useCase.execute(params);
}
