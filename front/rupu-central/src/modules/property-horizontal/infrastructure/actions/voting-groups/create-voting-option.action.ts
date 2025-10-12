/**
 * Server Action: Crear opción de votación
 */

'use server';

import { CreateVotingOptionUseCase } from '../../../application';
import { VotingOptionsRepository } from '../../repositories/votings.repository';
import { VotingOption, CreateVotingOptionDTO } from '../../../domain/entities';

export interface CreateVotingOptionInput {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
  data: CreateVotingOptionDTO;
}

export interface CreateVotingOptionResult {
  success: boolean;
  data?: VotingOption;
  error?: string;
}

export async function createVotingOptionAction(input: CreateVotingOptionInput): Promise<CreateVotingOptionResult> {
  try {
    const repository = new VotingOptionsRepository();
    const useCase = new CreateVotingOptionUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      votingId: input.votingId,
      data: input.data,
    });

    return {
      success: true,
      data: result.option,
    };
  } catch (error) {
    console.error('❌ Error en createVotingOptionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

