/**
 * Server Action: Votación masiva
 */

'use server';

import { CreateBulkVotesUseCase } from '../../application';
import { VotesRepository } from '../repositories';
import { BulkVoteResult, CreateBulkVotesDTO } from '../../domain/entities/vote.entity';

export interface CreateBulkVotesInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: CreateBulkVotesDTO;
}

export interface CreateBulkVotesResult {
  success: boolean;
  data?: BulkVoteResult;
  error?: string;
}

export async function createBulkVotesAction(input: CreateBulkVotesInput): Promise<CreateBulkVotesResult> {
  try {
    const repository = new VotesRepository();
    const useCase = new CreateBulkVotesUseCase(repository);

    const output = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      data: input.data,
    });

    return {
      success: true,
      data: output.result,
    };
  } catch (error) {
    console.error('Error en createBulkVotesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
