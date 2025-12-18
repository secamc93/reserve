'use server';

import { PackagesRepository } from '../repositories';
import { DeliverPackageUseCase } from '../../application';
import { DeliverPackageParams, Package } from '../../domain';

export async function deliverPackageAction(params: DeliverPackageParams): Promise<Package> {
  const repository = new PackagesRepository();
  const useCase = new DeliverPackageUseCase(repository);
  return await useCase.execute(params);
}
