/**
 * Caso de uso: Eliminar action
 */

import { IActionsRepository } from '../domain/ports';
import { DeleteActionParams, DeleteActionResponse } from '../domain/entities';

export class DeleteActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) { }

  async execute(params: DeleteActionParams): Promise<DeleteActionResponse> {
    return await this.actionsRepository.deleteAction(params);
  }
}

