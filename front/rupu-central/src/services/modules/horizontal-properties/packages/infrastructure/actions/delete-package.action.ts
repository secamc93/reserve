'use server';

import { PackagesRepository } from '../repositories';
import { DeletePackageUseCase } from '../../application';
import { DeletePackageParams } from '../../domain';

export async function deletePackageAction(params: DeletePackageParams): Promise<void> {
  const repository = new PackagesRepository();
  const useCase = new DeletePackageUseCase(repository);
  return await useCase.execute(params);
}
