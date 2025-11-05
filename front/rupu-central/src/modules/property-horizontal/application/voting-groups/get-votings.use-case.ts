/**
 * Caso de uso: Obtener votaciones de un grupo
 */

import { 
  IVotingsRepository, 
  GetVotingsParams 
} from '../../domain/ports';
import { VotingsList } from '../../domain/entities';

export interface GetVotingsOutput {
  votings: VotingsList;
}

export class GetVotingsUseCase {
  constructor(private votingsRepository: IVotingsRepository) {}

  async execute(params: GetVotingsParams): Promise<GetVotingsOutput> {
    const votings = await this.votingsRepository.getVotings(params);
    return { votings };
  }
}

