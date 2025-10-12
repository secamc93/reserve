/**
 * Caso de uso: Crear votación
 */

import { 
  IVotingsRepository, 
  CreateVotingParams 
} from '../../domain/ports';
import { Voting } from '../../domain/entities';

export interface CreateVotingOutput {
  voting: Voting;
}

export class CreateVotingUseCase {
  constructor(private votingsRepository: IVotingsRepository) {}

  async execute(params: CreateVotingParams): Promise<CreateVotingOutput> {
    const voting = await this.votingsRepository.createVoting(params);
    return { voting };
  }
}

