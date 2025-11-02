/**
 * Server Action: Crear voto
 */

'use server';

import { CreateVoteUseCase } from '../../../application';
import { VotesRepository } from '../../repositories/voting-groups';
import { Vote, CreateVoteDTO } from '../../../domain/entities';

export interface CreateVoteInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: CreateVoteDTO;
}

export interface CreateVoteResult {
  success: boolean;
  data?: Vote;
  error?: string;
}

export async function createVoteAction(input: CreateVoteInput): Promise<CreateVoteResult> {
  try {
    const repository = new VotesRepository();
    const useCase = new CreateVoteUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      data: input.data,
    });

    return {
      success: true,
      data: result.vote,
    };
  } catch (error) {
    console.error('❌ Error en createVoteAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

