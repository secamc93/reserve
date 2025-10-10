/**
 * Caso de uso: Crear grupo de votación
 */

import { 
  IVotingGroupsRepository, 
  CreateVotingGroupParams 
} from '../domain/ports/voting-groups.repository';
import { VotingGroup } from '../domain/entities/voting-group.entity';

export interface CreateVotingGroupOutput {
  votingGroup: VotingGroup;
}

export class CreateVotingGroupUseCase {
  constructor(private readonly votingGroupsRepository: IVotingGroupsRepository) {}

  async execute(input: CreateVotingGroupParams): Promise<CreateVotingGroupOutput> {
    const votingGroup = await this.votingGroupsRepository.createVotingGroup(input);
    return { votingGroup };
  }
}

