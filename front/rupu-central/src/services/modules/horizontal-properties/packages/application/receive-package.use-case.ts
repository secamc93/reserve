/**
 * Caso de uso: Recibir paquete
 */

import { IPackagesRepository, ReceivePackageParams, Package } from '../domain';

export class ReceivePackageUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: ReceivePackageParams): Promise<Package> {
    return await this.repository.receivePackage(params);
  }
}
