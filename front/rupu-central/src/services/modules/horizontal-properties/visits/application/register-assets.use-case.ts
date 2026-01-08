/**
 * Caso de uso: Registrar activos de visita
 */

import { IVisitsRepository, RegisterAssetsParams } from '../domain';

export class RegisterAssetsUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: RegisterAssetsParams): Promise<void> {
    return await this.repository.registerAssets(params);
  }
}
