/**
 * Caso de uso: Obtener paquete por ID
 */

import { IPackagesRepository, GetPackageByIdParams, Package } from '../domain';

export class GetPackageByIdUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: GetPackageByIdParams): Promise<Package> {
    return await this.repository.getPackageById(params);
  }
}
