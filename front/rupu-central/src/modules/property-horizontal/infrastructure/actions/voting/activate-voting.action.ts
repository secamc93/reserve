/**
 * Server Action: Activar votación
 */

'use server';

import { ActivateVotingUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/votings.repository';

export interface ActivateVotingInput {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
}

export interface ActivateVotingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function activateVotingAction(input: ActivateVotingInput): Promise<ActivateVotingResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new ActivateVotingUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('❌ Error en activateVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
