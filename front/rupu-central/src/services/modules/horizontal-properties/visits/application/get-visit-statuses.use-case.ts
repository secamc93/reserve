/**
 * Caso de uso: Obtener estados de visita
 */

import { IVisitsRepository, GetVisitStatusesParams, VisitStatus } from '../domain';

export class GetVisitStatusesUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitStatusesParams): Promise<VisitStatus[]> {
    return await this.repository.getVisitStatuses(params);
  }
}
