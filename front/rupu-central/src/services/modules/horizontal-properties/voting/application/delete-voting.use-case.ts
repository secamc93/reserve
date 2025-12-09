/**
 * Use Case: Eliminar/Desactivar votación
 */

import { VotingsRepository } from '../../infrastructure/repositories/voting-groups';

export interface DeleteVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface DeleteVotingResult {
  message: string;
}

export type DeleteVotingInput = DeleteVotingParams;

export class DeleteVotingUseCase {
  constructor(private repository: VotingsRepository) {}

  async execute(input: DeleteVotingInput): Promise<DeleteVotingResult> {
    // Validar que el ID de la votación sea válido
    if (!input.votingId || input.votingId <= 0) {
      throw new Error('ID de la votación inválido');
    }

    // Eliminar/desactivar votación
    const message = await this.repository.deleteVoting({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return { message };
  }
}
