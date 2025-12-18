/**
 * Caso de uso: Obtener lista de visitas
 */

import { IVisitsRepository, GetVisitsParams, VisitsPaginated } from '../domain';

export class GetVisitsUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitsParams): Promise<VisitsPaginated> {
    return await this.repository.getVisits(params);
  }
}
