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
  businessId: number; // ID de la propiedad horizontal (va en la URL, no en el body)
  data: CreateVotingGroupDTO;
}

export interface IVotingGroupsRepository {
  getVotingGroups(params: GetVotingGroupsParams): Promise<VotingGroupsList>;
  createVotingGroup(params: CreateVotingGroupParams): Promise<VotingGroup>;
}

