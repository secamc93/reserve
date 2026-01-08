/**
 * Caso de uso: Eliminar acompañante
 */

import { IVisitsRepository, DeleteCompanionParams } from '../domain';

export class DeleteCompanionUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: DeleteCompanionParams): Promise<void> {
    return await this.repository.deleteCompanion(params);
  }
}
