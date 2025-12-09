/**
 * Server Action: Obtener opciones de una votación
 */

'use server';

import { GetVotingOptionsUseCase } from '../../../application';
import { VotingOptionsRepository } from '../../repositories/voting-groups';
import { VotingOption } from '../../../domain/entities';

export interface GetVotingOptionsInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface GetVotingOptionsResult {
  success: boolean;
  data?: VotingOption[];
  error?: string;
}

export async function getVotingOptionsAction(input: GetVotingOptionsInput): Promise<GetVotingOptionsResult> {
  try {
    const repository = new VotingOptionsRepository();
    const useCase = new GetVotingOptionsUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
    });

    return {
      success: true,
      data: result.options.options,
    };
  } catch (error) {
    console.error('❌ Error en getVotingOptionsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

