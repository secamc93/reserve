/**
 * Caso de uso: Obtener lista de actions
 */

import { IActionsRepository } from '../../domain/ports/actions';
import { GetActionsParams, ActionsList } from '../../domain/entities/action.entity';

export class GetActionsUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) {}

  async execute(params: GetActionsParams): Promise<ActionsList> {
    return await this.actionsRepository.getActions(params);
  }
}

