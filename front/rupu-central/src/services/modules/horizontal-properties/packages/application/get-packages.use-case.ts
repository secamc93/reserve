/**
 * Caso de uso: Obtener paquetes
 */

import { IPackagesRepository, GetPackagesParams, PackagesPaginated } from '../domain';

export class GetPackagesUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: GetPackagesParams): Promise<PackagesPaginated> {
    return await this.repository.getPackages(params);
  }
}
