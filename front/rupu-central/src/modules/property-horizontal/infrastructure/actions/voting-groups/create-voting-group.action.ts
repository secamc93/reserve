/**
 * Server Action: Crear grupo de votación
 */

'use server';

import { CreateVotingGroupUseCase } from '../../../application';
import { VotingGroupsRepository } from '../../repositories/voting-groups.repository';
import { VotingGroup, CreateVotingGroupDTO } from '../../../domain/entities';

export interface CreateVotingGroupInput {
  token: string;
  businessId: number; // ID de la propiedad horizontal
  data: CreateVotingGroupDTO;
}

export interface CreateVotingGroupResult {
  success: boolean;
  data?: VotingGroup;
  error?: string;
}

export async function createVotingGroupAction(
  input: CreateVotingGroupInput
): Promise<CreateVotingGroupResult> {
  try {
    const repository = new VotingGroupsRepository();
    const useCase = new CreateVotingGroupUseCase(repository);
    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      data: input.data,
    });

    return {
      success: true,
      data: result.votingGroup,
    };
  } catch (error) {
    console.error('Error en createVotingGroupAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

