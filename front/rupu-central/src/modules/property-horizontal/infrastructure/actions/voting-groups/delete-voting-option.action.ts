'use server';

import { VotingOptionsRepository } from '../../repositories/voting-groups';
import { DeleteVotingOptionUseCase } from '../../../application';

export interface DeleteVotingOptionInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
}

export interface DeleteVotingOptionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteVotingOptionAction(
  input: DeleteVotingOptionInput
): Promise<DeleteVotingOptionResult> {
  try {
    const repository = new VotingOptionsRepository();
    const useCase = new DeleteVotingOptionUseCase(repository);
    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      optionId: input.optionId,
    });

    return { success: true, message: result.message };
  } catch (error) {
    console.error('❌ Error en deleteVotingOptionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al eliminar opción',
    };
  }
}


