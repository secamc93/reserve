/**
 * Caso de uso: Crear visita
 */

import { IVisitsRepository, CreateVisitParams, Visit } from '../domain';

export class CreateVisitUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: CreateVisitParams): Promise<Visit> {
    return await this.repository.createVisit(params);
  }
}
