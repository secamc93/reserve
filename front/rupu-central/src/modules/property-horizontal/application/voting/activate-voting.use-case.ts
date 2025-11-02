/**
 * Use Case: Activar votación
 */

import { VotingsRepository } from '../../infrastructure/repositories/voting-groups';

export interface ActivateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface ActivateVotingResult {
  message: string;
}

export type ActivateVotingInput = ActivateVotingParams;

export class ActivateVotingUseCase {
  constructor(private repository: VotingsRepository) {}

  async execute(input: ActivateVotingInput): Promise<ActivateVotingResult> {
    // Validar que el ID de la votación sea válido
    if (!input.votingId || input.votingId <= 0) {
      throw new Error('ID de la votación inválido');
    }

    // Activar votación
    const message = await this.repository.activateVoting({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return { message };
  }
}
