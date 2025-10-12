/**
 * Puerto: Repositorio de Grupos de Votación
 */

import { VotingGroup, VotingGroupsList, CreateVotingGroupDTO } from '../entities';

export interface GetVotingGroupsParams {
  token: string;
  businessId: number;
}

export interface CreateVotingGroupParams {
  token: string;
  data: CreateVotingGroupDTO;
}

export interface IVotingGroupsRepository {
  getVotingGroups(params: GetVotingGroupsParams): Promise<VotingGroupsList>;
  createVotingGroup(params: CreateVotingGroupParams): Promise<VotingGroup>;
}

