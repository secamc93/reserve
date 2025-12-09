/**
 * Caso de uso: Crear opción de votación
 */

import { 
  IVotingOptionsRepository, 
  CreateVotingOptionParams 
} from '../../domain/ports';
import { VotingOption } from '../../domain/entities';

export interface CreateVotingOptionOutput {
  option: VotingOption;
}

export class CreateVotingOptionUseCase {
  constructor(private votingOptionsRepository: IVotingOptionsRepository) {}

  async execute(params: CreateVotingOptionParams): Promise<CreateVotingOptionOutput> {
    const option = await this.votingOptionsRepository.createVotingOption(params);
    return { option };
  }
}

