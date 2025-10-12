/**
 * Caso de uso: Obtener votos de una votación
 */

import { 
  IVotesRepository, 
  GetVotesParams 
} from '../../domain/ports';
import { VotesList } from '../../domain/entities';

export interface GetVotesOutput {
  votes: VotesList;
}

export class GetVotesUseCase {
  constructor(private votesRepository: IVotesRepository) {}

  async execute(params: GetVotesParams): Promise<GetVotesOutput> {
    const votes = await this.votesRepository.getVotes(params);
    return { votes };
  }
}

