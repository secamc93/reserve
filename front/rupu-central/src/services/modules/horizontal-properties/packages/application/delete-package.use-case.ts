/**
 * Caso de uso: Eliminar paquete
 */

import { IPackagesRepository, DeletePackageParams } from '../domain';

export class DeletePackageUseCase {
  constructor(private repository: IPackagesRepository) {}

  async execute(params: DeletePackageParams): Promise<void> {
    return await this.repository.deletePackage(params);
  }
}
