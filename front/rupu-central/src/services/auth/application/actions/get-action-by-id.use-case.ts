/**
 * Caso de uso: Obtener action por ID
 */

import { IActionsRepository } from '../../domain/ports/actions';
import { GetActionByIdParams, CreateActionResponse } from '../../domain/entities/action.entity';

export class GetActionByIdUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) {}

  async execute(params: GetActionByIdParams): Promise<CreateActionResponse> {
    return await this.actionsRepository.getActionById(params);
  }
}

