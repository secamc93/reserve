/**
 * Caso de uso: Obtener opciones de una votación
 */

import { 
  IVotingOptionsRepository, 
  GetVotingOptionsParams 
} from '../../domain/ports';
import { VotingOptionsList } from '../../domain/entities';

export interface GetVotingOptionsOutput {
  options: VotingOptionsList;
}

export class GetVotingOptionsUseCase {
  constructor(private votingOptionsRepository: IVotingOptionsRepository) {}

  async execute(params: GetVotingOptionsParams): Promise<GetVotingOptionsOutput> {
    const options = await this.votingOptionsRepository.getVotingOptions(params);
    return { options };
  }
}

