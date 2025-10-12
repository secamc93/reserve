/**
 * Caso de uso: Crear voto
 */

import { 
  IVotesRepository, 
  CreateVoteParams 
} from '../../domain/ports';
import { Vote } from '../../domain/entities';

export interface CreateVoteOutput {
  vote: Vote;
}

export class CreateVoteUseCase {
  constructor(private votesRepository: IVotesRepository) {}

  async execute(params: CreateVoteParams): Promise<CreateVoteOutput> {
    const vote = await this.votesRepository.createVote(params);
    return { vote };
  }
}

