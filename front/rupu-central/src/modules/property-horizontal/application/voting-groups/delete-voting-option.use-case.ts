/**
 * Caso de uso: Eliminar opción de votación
 */

import {
  IVotingOptionsRepository,
  DeleteVotingOptionParams,
} from '../../domain/ports';

export interface DeleteVotingOptionOutput {
  message: string;
}

export class DeleteVotingOptionUseCase {
  constructor(private votingOptionsRepository: IVotingOptionsRepository) {}

  async execute(params: DeleteVotingOptionParams): Promise<DeleteVotingOptionOutput> {
    const message = await this.votingOptionsRepository.deleteVotingOption(params);
    return { message };
  }
}


