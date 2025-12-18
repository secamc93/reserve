'use server';

import { CommonAreasRepository } from '../repositories';
import { GetCommonAreasUseCase } from '../../application/get-common-areas.use-case';
import { GetCommonAreasParams, CommonAreasPaginated } from '../../domain';

export async function getCommonAreasAction(params: GetCommonAreasParams): Promise<CommonAreasPaginated> {
  const repository = new CommonAreasRepository();
  const useCase = new GetCommonAreasUseCase(repository);
  return await useCase.execute(params);
}
