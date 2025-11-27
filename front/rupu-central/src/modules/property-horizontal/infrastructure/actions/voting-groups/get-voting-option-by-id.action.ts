'use server';

import { VotingOptionsRepository } from '../../repositories/voting-groups';
import { GetVotingOptionByIdUseCase } from '../../../application';
import { VotingOption } from '../../../domain/entities';

export interface GetVotingOptionByIdInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
}

export interface GetVotingOptionByIdResult {
  success: boolean;
  data?: VotingOption;
  error?: string;
}

export async function getVotingOptionByIdAction(
  input: GetVotingOptionByIdInput
): Promise<GetVotingOptionByIdResult> {
  try {
    const repository = new VotingOptionsRepository();
    const useCase = new GetVotingOptionByIdUseCase(repository);
    const result = await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      optionId: input.optionId,
    });

    return { success: true, data: result.option };
  } catch (error) {
    console.error('❌ Error en getVotingOptionByIdAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener opción',
    };
  }
}


