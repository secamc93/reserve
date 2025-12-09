'use server';

import { VotingOptionsRepository } from '../repositories';
import { UpdateVotingOptionStatusUseCase } from '../../application';
import { VotingOption } from '../../../domain/entities';

export interface UpdateVotingOptionStatusInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
  isActive: boolean;
}

export interface UpdateVotingOptionStatusResult {
  success: boolean;
  data?: VotingOption;
  error?: string;
}

export async function updateVotingOptionStatusAction(
  input: UpdateVotingOptionStatusInput
): Promise<UpdateVotingOptionStatusResult> {
  try {
    const repository = new VotingOptionsRepository();
    const useCase = new UpdateVotingOptionStatusUseCase(repository);
    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      optionId: input.optionId,
      isActive: input.isActive,
    });

    return { success: true, data: result.option };
  } catch (error) {
    console.error('❌ Error en updateVotingOptionStatusAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar opción',
    };
  }
}


