/**
 * Server Action: Actualizar grupo de votación
 */

'use server';

import { UpdateVotingGroupUseCase } from '../../../application';
import { VotingGroupsRepository } from '../../repositories/voting-groups';
import { VotingGroup, UpdateVotingGroupDTO } from '../../../domain/entities';

export interface UpdateVotingGroupInput {
  token: string;
  businessId: number;
  groupId: number;
  data: UpdateVotingGroupDTO;
}

export interface UpdateVotingGroupResult {
  success: boolean;
  data?: VotingGroup;
  error?: string;
}

export async function updateVotingGroupAction(input: UpdateVotingGroupInput): Promise<UpdateVotingGroupResult> {
  try {
    const repository = new VotingGroupsRepository();
    const useCase = new UpdateVotingGroupUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      data: input.data,
    });

    return {
      success: true,
      data: result.group,
    };
  } catch (error) {
    console.error('❌ Error en updateVotingGroupAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
