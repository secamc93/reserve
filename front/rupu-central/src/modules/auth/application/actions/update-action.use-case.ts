/**
 * Caso de uso: Actualizar action
 */

import { IActionsRepository } from '../../domain/ports/actions';
import { UpdateActionParams, UpdateActionResponse } from '../../domain/entities/action.entity';

export class UpdateActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) {}

  async execute(params: UpdateActionParams): Promise<UpdateActionResponse> {
    return await this.actionsRepository.updateAction(params);
  }
}

