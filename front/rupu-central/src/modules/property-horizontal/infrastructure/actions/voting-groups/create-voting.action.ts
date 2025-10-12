/**
 * Server Action: Crear votación
 */

'use server';

import { CreateVotingUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/votings.repository';
import { Voting, CreateVotingDTO } from '../../../domain/entities';

export interface CreateVotingInput {
  token: string;
  hpId: number;
  groupId: number;
  data: CreateVotingDTO;
}

export interface CreateVotingResult {
  success: boolean;
  data?: Voting;
  error?: string;
}

export async function createVotingAction(input: CreateVotingInput): Promise<CreateVotingResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new CreateVotingUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
      data: input.data,
    });

    return {
      success: true,
      data: result.voting,
    };
  } catch (error) {
    console.error('❌ Error en createVotingAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

