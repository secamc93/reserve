'use server';

import { PackagesRepository } from '../repositories';
import { GetPackagesUseCase } from '../../application';
import { GetPackagesParams, PackagesPaginated } from '../../domain';

export async function getPackagesAction(params: GetPackagesParams): Promise<PackagesPaginated> {
  const repository = new PackagesRepository();
  const useCase = new GetPackagesUseCase(repository);
  return await useCase.execute(params);
}
