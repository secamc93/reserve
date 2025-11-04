/**
 * Caso de uso: Eliminar action
 */

import { IActionsRepository } from '../../domain/ports/actions';
import { DeleteActionParams, DeleteActionResponse } from '../../domain/entities/action.entity';

export class DeleteActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) {}

  async execute(params: DeleteActionParams): Promise<DeleteActionResponse> {
    return await this.actionsRepository.deleteAction(params);
  }
}

