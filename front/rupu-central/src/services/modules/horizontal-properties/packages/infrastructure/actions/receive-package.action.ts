'use server';

import { PackagesRepository } from '../repositories';
import { ReceivePackageUseCase } from '../../application';
import { ReceivePackageParams, Package } from '../../domain';

export async function receivePackageAction(params: ReceivePackageParams): Promise<Package> {
  const repository = new PackagesRepository();
  const useCase = new ReceivePackageUseCase(repository);
  return await useCase.execute(params);
}
