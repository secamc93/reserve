/**
 * Caso de uso: Crear action
 */

import { IActionsRepository } from '../../domain/ports/actions';
import { CreateActionParams, CreateActionResponse } from '../../domain/entities/action.entity';

export class CreateActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) {}

  async execute(params: CreateActionParams): Promise<CreateActionResponse> {
    return await this.actionsRepository.createAction(params);
  }
}

