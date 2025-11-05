/**
 * Puerto: Repositorio de Grupos de Votación
 */

import { VotingGroup, VotingGroupsList, CreateVotingGroupDTO, UpdateVotingGroupDTO } from '../entities';

export interface GetVotingGroupsParams {
  token: string;
  businessId: number;
}

export interface CreateVotingGroupParams {
  token: string;
  businessId: number; // ID de la propiedad horizontal (va en el body, no en la URL)
  data: CreateVotingGroupDTO;
}

export interface UpdateVotingGroupParams {
  token: string;
  businessId: number;
  groupId: number;
  data: UpdateVotingGroupDTO;
}

export interface DeleteVotingGroupParams {
  token: string;
  businessId: number;
  groupId: number;
}

export interface IVotingGroupsRepository {
  getVotingGroups(params: GetVotingGroupsParams): Promise<VotingGroupsList>;
  createVotingGroup(params: CreateVotingGroupParams): Promise<VotingGroup>;
  updateVotingGroup(params: UpdateVotingGroupParams): Promise<VotingGroup>;
  deleteVotingGroup(params: DeleteVotingGroupParams): Promise<string>;
}

