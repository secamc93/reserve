/**
 * Caso de uso: Registrar salida de visita
 */

import { IVisitsRepository, RegisterExitParams, Visit } from '../domain';

export class RegisterExitUseCase {
  constructor(private repository: IVisitsRepository) {}

  async execute(params: RegisterExitParams): Promise<Visit> {
    return await this.repository.registerExit(params);
  }
}
