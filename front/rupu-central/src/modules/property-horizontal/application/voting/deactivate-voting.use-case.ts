/**
 * Use Case: Desactivar votación
 */

import { VotingsRepository } from '../../infrastructure/repositories/voting-groups';

export interface DeactivateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface DeactivateVotingResult {
  message: string;
}

export type DeactivateVotingInput = DeactivateVotingParams;

export class DeactivateVotingUseCase {
  constructor(private repository: VotingsRepository) {}

  async execute(input: DeactivateVotingInput): Promise<DeactivateVotingResult> {
    // Validar que el ID de la votación sea válido
    if (!input.votingId || input.votingId <= 0) {
      throw new Error('ID de la votación inválido');
    }

    // Desactivar votación
    const message = await this.repository.deactivateVoting({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return { message };
  }
}
