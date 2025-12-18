/**
 * Caso de uso: Entregar paquete
 */

import { IPackagesRepository, DeliverPackageParams, Package } from '../domain';

export class DeliverPackageUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: DeliverPackageParams): Promise<Package> {
    return await this.repository.deliverPackage(params);
  }
}
