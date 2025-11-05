'use server';

import { ResidentsRepository } from '../../repositories/residents';
import { GetResidentByIdUseCase } from '../../../application';
import { GetResidentByIdParams, Resident } from '../../../domain';

export async function getResidentByIdAction(params: GetResidentByIdParams): Promise<Resident> {
  const repository = new ResidentsRepository();
  const useCase = new GetResidentByIdUseCase(repository);
  return await useCase.execute(params);
}
