/**
 * Server Action: Eliminar/Desactivar grupo de votación
 */

'use server';

import { DeleteVotingGroupUseCase } from '../../../application';
import { VotingGroupsRepository } from '../../repositories/voting-groups';

export interface DeleteVotingGroupInput {
  token: string;
  businessId: number;
  groupId: number;
}

export interface DeleteVotingGroupResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteVotingGroupAction(input: DeleteVotingGroupInput): Promise<DeleteVotingGroupResult> {
  try {
    const repository = new VotingGroupsRepository();
    const useCase = new DeleteVotingGroupUseCase(repository);

    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
    });

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('❌ Error en deleteVotingGroupAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
