/**
 * Caso de uso: Actualizar visita
 */

import { IVisitsRepository, UpdateVisitParams, Visit } from '../domain';

export class UpdateVisitUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: UpdateVisitParams): Promise<Visit> {
    return await this.repository.updateVisit(params);
  }
}
