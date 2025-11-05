/**
 * Server Action: Desactivar votación
 */

'use server';

import { DeactivateVotingUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/voting-groups';

export interface DeactivateVotingInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface DeactivateVotingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deactivateVotingAction(input: DeactivateVotingInput): Promise<DeactivateVotingResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new DeactivateVotingUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('❌ Error en deactivateVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
