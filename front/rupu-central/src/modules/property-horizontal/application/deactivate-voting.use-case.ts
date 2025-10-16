/**
 * Use Case: Desactivar votación
 */

import { VotingsRepository } from '../infrastructure/repositories/votings.repository';

export interface DeactivateVotingParams {
  token: string;
  hpId: number;
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
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return { message };
  }
}
