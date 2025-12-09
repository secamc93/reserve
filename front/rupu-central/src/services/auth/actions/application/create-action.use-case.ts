/**
 * Caso de uso: Crear action
 */

import { IActionsRepository } from '../domain/ports';
import { CreateActionParams, CreateActionResponse } from '../../domain/entities';

export class CreateActionUseCase {
  constructor(private readonly actionsRepository: IActionsRepository) { }

  async execute(params: CreateActionParams): Promise<CreateActionResponse> {
    return await this.actionsRepository.createAction(params);
  }
}

