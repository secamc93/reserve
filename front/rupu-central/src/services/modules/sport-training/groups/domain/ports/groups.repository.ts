import { TrainingGroup, GroupPlayer, CreateGroupDTO, UpdateGroupDTO, AddPlayerToGroupDTO } from '../entities';

export interface GetGroupsParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
}

export interface GetGroupByIdParams {
  businessId: number;
  groupId: number;
  token: string;
}

export interface CreateGroupParams {
  token: string;
  data: CreateGroupDTO;
}

export interface UpdateGroupParams {
  businessId: number;
  groupId: number;
  token: string;
  data: UpdateGroupDTO;
}

export interface AddPlayerToGroupParams {
  groupId: number;
  token: string;
  data: AddPlayerToGroupDTO;
}

export interface RemovePlayerFromGroupParams {
  groupId: number;
  playerId: number;
  token: string;
}

export interface GetGroupPlayersParams {
  groupId: number;
  businessId: number;
  token: string;
}

export interface GroupsPaginated {
  data: TrainingGroup[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IGroupsRepository {
  getGroups(params: GetGroupsParams): Promise<GroupsPaginated>;
  getGroupById(params: GetGroupByIdParams): Promise<TrainingGroup>;
  createGroup(params: CreateGroupParams): Promise<TrainingGroup>;
  updateGroup(params: UpdateGroupParams): Promise<TrainingGroup>;
  addPlayer(params: AddPlayerToGroupParams): Promise<void>;
  removePlayer(params: RemovePlayerFromGroupParams): Promise<void>;
  getGroupPlayers(params: GetGroupPlayersParams): Promise<GroupPlayer[]>;
}
