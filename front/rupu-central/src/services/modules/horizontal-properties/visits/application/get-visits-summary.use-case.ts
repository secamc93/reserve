/**
 * Caso de uso: Resumen de visitas de un día (conteos por estado de portería)
 */

import { IVisitsRepository, GetVisitsSummaryParams, VisitsSummary } from '../domain';

export class GetVisitsSummaryUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitsSummaryParams): Promise<VisitsSummary> {
    return await this.repository.getVisitsSummary(params);
  }
}
