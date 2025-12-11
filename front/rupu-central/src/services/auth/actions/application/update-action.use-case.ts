/**
 * Caso de uso: Actualizar action
 */

import { IActionsRepository } from '../domain/ports';
import { UpdateActionParams, UpdateActionResponse } from '../domain/entities';

export class UpdateActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) { }

  async execute(params: UpdateActionParams): Promise<UpdateActionResponse> {
    return await this.actionsRepository.updateAction(params);
  }
}

