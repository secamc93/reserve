/**
 * Caso de uso: Obtener visita por ID
 */

import { IVisitsRepository, GetVisitByIdParams, Visit } from '../domain';

export class GetVisitByIdUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitByIdParams): Promise<Visit> {
    return await this.repository.getVisitById(params);
  }
}
