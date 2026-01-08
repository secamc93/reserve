/**
 * Caso de uso: Obtener acompañantes de una visita
 */

import { IVisitsRepository, GetCompanionsParams, VisitCompanion } from '../domain';

export class GetCompanionsUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetCompanionsParams): Promise<VisitCompanion[]> {
    return await this.repository.getCompanions(params);
  }
}
