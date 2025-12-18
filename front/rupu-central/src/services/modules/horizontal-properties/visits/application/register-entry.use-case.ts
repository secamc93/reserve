/**
 * Caso de uso: Registrar entrada de visita
 */

import { IVisitsRepository, RegisterEntryParams, Visit } from '../domain';

export class RegisterEntryUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: RegisterEntryParams): Promise<Visit> {
    return await this.repository.registerEntry(params);
  }
}
