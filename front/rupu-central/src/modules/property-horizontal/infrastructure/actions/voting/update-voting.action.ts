/**
 * Server Action: Actualizar votación
 */

'use server';

import { UpdateVotingUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/voting-groups';
import { Voting, UpdateVotingDTO } from '../../../domain/entities';

export interface UpdateVotingInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: UpdateVotingDTO;
}

export interface UpdateVotingResult {
  success: boolean;
  data?: Voting;
  error?: string;
}

export async function updateVotingAction(input: UpdateVotingInput): Promise<UpdateVotingResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new UpdateVotingUseCase(repository);

    const result = await useCase.execute({
      id: input.votingId,
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      data: input.data as Record<string, unknown>,
    });

    return {
      success: true,
      data: result.voting,
    };
  } catch (error) {
    console.error('❌ Error en updateVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
