/**
 * Puerto: Repositorio de Votaciones
 */

import { Voting, VotingsList, CreateVotingDTO, UpdateVotingDTO, VotingOption, VotingOptionsList, CreateVotingOptionDTO, Vote, VotesList, CreateVoteDTO } from '../entities';

// ============================================
// VOTINGS (Votaciones)
// ============================================

export interface GetVotingsParams {
  token: string;
  businessId: number;
  groupId: number;
}

export interface GetVotingByIdParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface CreateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  data: CreateVotingDTO;
}

export interface UpdateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: UpdateVotingDTO;
}

export interface DeleteVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface ActivateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface DeactivateVotingParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface IVotingsRepository {
  getVotings(params: GetVotingsParams): Promise<VotingsList>;
  getVotingById(params: GetVotingByIdParams): Promise<Voting>;
  createVoting(params: CreateVotingParams): Promise<Voting>;
  updateVoting(params: UpdateVotingParams): Promise<Voting>;
  deleteVoting(params: DeleteVotingParams): Promise<string>;
  activateVoting(params: ActivateVotingParams): Promise<string>;
  deactivateVoting(params: DeactivateVotingParams): Promise<string>;
}

// ============================================
// VOTING OPTIONS (Opciones de Votación)
// ============================================

export interface GetVotingOptionsParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface CreateVotingOptionParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: CreateVotingOptionDTO;
}

export interface GetVotingOptionByIdParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
}

export interface UpdateVotingOptionStatusParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
  isActive: boolean;
}

export interface DeleteVotingOptionParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  optionId: number;
}

export interface IVotingOptionsRepository {
  getVotingOptions(params: GetVotingOptionsParams): Promise<VotingOptionsList>;
  createVotingOption(params: CreateVotingOptionParams): Promise<VotingOption>;
  getVotingOptionById(params: GetVotingOptionByIdParams): Promise<VotingOption>;
  updateVotingOptionStatus(params: UpdateVotingOptionStatusParams): Promise<VotingOption>;
  deleteVotingOption(params: DeleteVotingOptionParams): Promise<string>;
}

// ============================================
// VOTES (Votos)
// ============================================

export interface GetVotesParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
}

export interface CreateVoteParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  data: CreateVoteDTO;
}

// ✅ NUEVO: Parámetros para marcar asistencia
export interface MarkUnitAttendanceParams {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  unitId: number;
  markAttendance: boolean;
}

export interface IVotesRepository {
  getVotes(params: GetVotesParams): Promise<VotesList>;
  createVote(params: CreateVoteParams): Promise<Vote>;
  markUnitAttendance(params: MarkUnitAttendanceParams): Promise<void>; // ✅ NUEVO
}

