/**
 * Caso de uso: Crear acompañante
 */

import { IVisitsRepository, CreateCompanionParams, VisitCompanion } from '../domain';

export class CreateCompanionUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: CreateCompanionParams): Promise<VisitCompanion> {
    return await this.repository.createCompanion(params);
  }
}
