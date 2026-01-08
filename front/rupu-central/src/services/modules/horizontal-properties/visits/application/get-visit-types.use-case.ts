/**
 * Caso de uso: Obtener tipos de visita
 */

import { IVisitsRepository, GetVisitTypesParams, VisitType } from '../domain';

export class GetVisitTypesUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: GetVisitTypesParams): Promise<VisitType[]> {
    return await this.repository.getVisitTypes(params);
  }
}
