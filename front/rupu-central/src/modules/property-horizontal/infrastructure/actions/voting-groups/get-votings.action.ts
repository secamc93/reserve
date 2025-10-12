/**
 * Server Action: Obtener votaciones de un grupo
 */

'use server';

import { GetVotingsUseCase } from '../../../application';
import { VotingsRepository } from '../../repositories/votings.repository';
import { Voting } from '../../../domain/entities';

export interface GetVotingsInput {
  token: string;
  hpId: number;
  groupId: number;
}

export interface GetVotingsResult {
  success: boolean;
  data?: Voting[];
  error?: string;
}

export async function getVotingsAction(input: GetVotingsInput): Promise<GetVotingsResult> {
  try {
    const repository = new VotingsRepository();
    const useCase = new GetVotingsUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      hpId: input.hpId,
      groupId: input.groupId,
    });

    return {
      success: true,
      data: result.votings.votings,
    };
  } catch (error) {
    console.error('❌ Error en getVotingsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

