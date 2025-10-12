/**
 * Server Action: Obtener votos de una votación
 */

'use server';

import { GetVotesUseCase } from '../../../application';
import { VotesRepository } from '../../repositories/votings.repository';
import { Vote } from '../../../domain/entities';

export interface GetVotesInput {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
}

export interface GetVotesResult {
  success: boolean;
  data?: Vote[];
  error?: string;
}

export async function getVotesAction(input: GetVotesInput): Promise<GetVotesResult> {
  try {
    const repository = new VotesRepository();
    const useCase = new GetVotesUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return {
      success: true,
      data: result.votes.votes,
    };
  } catch (error) {
    console.error('❌ Error en getVotesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

