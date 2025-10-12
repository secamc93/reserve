/**
 * Puerto: Repositorio de Votaciones
 */

import { Voting, VotingsList, CreateVotingDTO, VotingOption, VotingOptionsList, CreateVotingOptionDTO, Vote, VotesList, CreateVoteDTO } from '../entities';

// ============================================
// VOTINGS (Votaciones)
// ============================================

export interface GetVotingsParams {
  token: string;
  hpId: number;
  groupId: number;
}

export interface CreateVotingParams {
  token: string;
  hpId: number;
  groupId: number;
  data: CreateVotingDTO;
}

export interface IVotingsRepository {
  getVotings(params: GetVotingsParams): Promise<VotingsList>;
  createVoting(params: CreateVotingParams): Promise<Voting>;
}

// ============================================
// VOTING OPTIONS (Opciones de Votación)
// ============================================

export interface GetVotingOptionsParams {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
}

export interface CreateVotingOptionParams {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
  data: CreateVotingOptionDTO;
}

export interface IVotingOptionsRepository {
  getVotingOptions(params: GetVotingOptionsParams): Promise<VotingOptionsList>;
  createVotingOption(params: CreateVotingOptionParams): Promise<VotingOption>;
}

// ============================================
// VOTES (Votos)
// ============================================

export interface GetVotesParams {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
}

export interface CreateVoteParams {
  token: string;
  hpId: number;
  groupId: number;
  votingId: number;
  data: CreateVoteDTO;
}

export interface IVotesRepository {
  getVotes(params: GetVotesParams): Promise<VotesList>;
  createVote(params: CreateVoteParams): Promise<Vote>;
}

