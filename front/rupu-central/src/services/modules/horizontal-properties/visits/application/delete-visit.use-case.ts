/**
 * Caso de uso: Eliminar visita
 */

import { IVisitsRepository, DeleteVisitParams } from '../domain';

export class DeleteVisitUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: DeleteVisitParams): Promise<void> {
    return await this.repository.deleteVisit(params);
  }
}
