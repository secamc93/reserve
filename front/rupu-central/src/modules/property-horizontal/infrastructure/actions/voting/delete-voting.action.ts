/**
 * Server Action: Eliminar/Desactivar votación
 */

'use server';

import { DeleteVotingUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/votings.repository';

export interface DeleteVotingInput {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
}

export interface DeleteVotingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteVotingAction(input: DeleteVotingInput): Promise<DeleteVotingResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new DeleteVotingUseCase(repository);

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
    console.error('❌ Error en deleteVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
