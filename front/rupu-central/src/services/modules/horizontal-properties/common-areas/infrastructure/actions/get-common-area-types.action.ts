'use server';

import { CommonAreasRepository } from '../repositories';
import { GetCommonAreaTypesUseCase } from '../../application/get-common-area-types.use-case';
import { CommonAreaType } from '../../domain';

export async function getCommonAreaTypesAction(token: string): Promise<CommonAreaType[]> {
  const repository = new CommonAreasRepository();
  const useCase = new GetCommonAreaTypesUseCase(repository);
  return await useCase.execute(token);
}
