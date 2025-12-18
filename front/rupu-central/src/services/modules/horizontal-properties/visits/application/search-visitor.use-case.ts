/**
 * Caso de uso: Buscar visitante por DNI
 */

import { IVisitsRepository, SearchVisitorParams, Visitor } from '../domain';

export class SearchVisitorUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: SearchVisitorParams): Promise<Visitor> {
    return await this.repository.searchVisitor(params);
  }
}
