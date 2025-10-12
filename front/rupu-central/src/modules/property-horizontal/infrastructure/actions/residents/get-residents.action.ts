'use server';

import { ResidentsRepository } from '../../repositories/residents.repository';
import { GetResidentsUseCase } from '../../../application';
import { GetResidentsParams, ResidentsPaginated } from '../../../domain';

export async function getResidentsAction(params: GetResidentsParams): Promise<ResidentsPaginated> {
  const repository = new ResidentsRepository();
  const useCase = new GetResidentsUseCase(repository);
  return await useCase.execute(params);
}
