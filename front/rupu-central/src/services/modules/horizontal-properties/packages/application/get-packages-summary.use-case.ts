/**
 * Caso de uso: Resumen de paquetes (conteos por grupo para la portería)
 */

import { IPackagesRepository, GetPackagesSummaryParams, PackagesSummary } from '../domain';

export class GetPackagesSummaryUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: GetPackagesSummaryParams): Promise<PackagesSummary> {
    return await this.repository.getPackagesSummary(params);
  }
}
