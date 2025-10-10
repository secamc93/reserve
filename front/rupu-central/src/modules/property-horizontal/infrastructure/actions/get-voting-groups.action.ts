/**
 * Server Action: Obtener grupos de votación
 */

'use server';

import { GetVotingGroupsUseCase } from '../../application/get-voting-groups.use-case';
import { VotingGroupsRepository } from '../repositories/voting-groups.repository';
import { VotingGroup } from '../../domain/entities/voting-group.entity';

export interface GetVotingGroupsInput {
  token: string;
  businessId: number;
}

export interface GetVotingGroupsResult {
  success: boolean;
  data?: VotingGroup[];
  error?: string;
}

export async function getVotingGroupsAction(
  input: GetVotingGroupsInput
): Promise<GetVotingGroupsResult> {
  try {
    const repository = new VotingGroupsRepository();
    const useCase = new GetVotingGroupsUseCase(repository);
    const result = await useCase.execute(input);

    return {
      success: true,
      data: result.votingGroups.votingGroups,
    };
  } catch (error) {
    console.error('Error en getVotingGroupsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

