'use server';

import { CommonAreasRepository } from '../repositories';
import { CreateCommonAreaUseCase } from '../../application/create-common-area.use-case';
import { CreateCommonAreaParams, CommonArea } from '../../domain';

export async function createCommonAreaAction(params: CreateCommonAreaParams): Promise<CommonArea> {
  const repository = new CommonAreasRepository();
  const useCase = new CreateCommonAreaUseCase(repository);
  return await useCase.execute(params);
}
