'use server';

import { GetVotingByIdUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/voting-groups';
import { Voting } from '../../../domain/entities';

export interface GetVotingByIdInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface GetVotingByIdResult {
  success: boolean;
  data?: Voting;
  error?: string;
}

export async function getVotingByIdAction(
  input: GetVotingByIdInput
): Promise<GetVotingByIdResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new GetVotingByIdUseCase(repository);

    const result = await useCase.execute({
      id: input.votingId,
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return {
      success: true,
      data: result.voting,
    };
  } catch (error) {
    console.error('❌ Error en getVotingByIdAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
