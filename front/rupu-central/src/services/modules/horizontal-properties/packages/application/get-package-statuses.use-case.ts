/**
 * Caso de uso: Obtener estados de paquete
 */

import { IPackagesRepository, GetPackageStatusesParams, PackageStatus } from '../domain';

export class GetPackageStatusesUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: GetPackageStatusesParams): Promise<PackageStatus[]> {
    return await this.repository.getPackageStatuses(params);
  }
}
