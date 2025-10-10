/**
 * Caso de uso: Obtener grupos de votación
 */

import { 
  IVotingGroupsRepository, 
  GetVotingGroupsParams 
} from '../domain/ports/voting-groups.repository';
import { VotingGroupsList } from '../domain/entities/voting-group.entity';

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

