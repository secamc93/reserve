/**
 * Caso de uso: Obtener opción de votación por ID
 */

import {
  IVotingOptionsRepository,
  GetVotingOptionByIdParams,
} from '../domain/ports';
import { VotingOption } from '../domain/entities';

export interface GetVotingOptionByIdOutput {
  option: VotingOption;
}

export class GetVotingOptionByIdUseCase {
  constructor(private votingOptionsRepository: IVotingOptionsRepository) {}

  async execute(params: GetVotingOptionByIdParams): Promise<GetVotingOptionByIdOutput> {
    const option = await this.votingOptionsRepository.getVotingOptionById(params);
    return { option };
  }
}


