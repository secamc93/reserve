/**
 * Caso de uso: Obtener grupos de votación
 */

import { 
  IVotingGroupsRepository, 
  GetVotingGroupsParams 
} from '../../domain/ports';
import { VotingGroupsList } from '../../domain/entities';

export interface GetVotingGroupsOutput {
  votingGroups: VotingGroupsList;
}

export class GetVotingGroupsUseCase {
  constructor(private readonly votingGroupsRepository: IVotingGroupsRepository) {}

  async execute(input: GetVotingGroupsParams): Promise<GetVotingGroupsOutput> {
    const votingGroups = await this.votingGroupsRepository.getVotingGroups(input);
    return { votingGroups };
  }
}

