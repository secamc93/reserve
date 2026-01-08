'use server';

import { PackagesRepository } from '../repositories';
import { GetPackageStatusesUseCase } from '../../application';
import { GetPackageStatusesParams, PackageStatus } from '../../domain';

export async function getPackageStatusesAction(params: GetPackageStatusesParams): Promise<PackageStatus[]> {
  const repository = new PackagesRepository();
  const useCase = new GetPackageStatusesUseCase(repository);
  return await useCase.execute(params);
}
