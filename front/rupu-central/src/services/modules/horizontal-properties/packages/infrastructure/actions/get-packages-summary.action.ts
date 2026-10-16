'use server';

import { PackagesRepository } from '../repositories';
import { GetPackagesSummaryUseCase } from '../../application';
import { GetPackagesSummaryParams, PackagesSummary } from '../../domain';

export async function getPackagesSummaryAction(params: GetPackagesSummaryParams): Promise<PackagesSummary> {
  const repository = new PackagesRepository();
  const useCase = new GetPackagesSummaryUseCase(repository);
  return await useCase.execute(params);
}
