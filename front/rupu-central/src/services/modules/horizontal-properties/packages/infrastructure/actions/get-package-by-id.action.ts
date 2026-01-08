'use server';

import { PackagesRepository } from '../repositories';
import { GetPackageByIdUseCase } from '../../application';
import { GetPackageByIdParams, Package } from '../../domain';

export async function getPackageByIdAction(params: GetPackageByIdParams): Promise<Package> {
  const repository = new PackagesRepository();
  const useCase = new GetPackageByIdUseCase(repository);
  return await useCase.execute(params);
}
