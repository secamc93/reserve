/**
 * Entity: Voting (Votación)
 */

export interface Voting {
  id: number;
  votingGroupId: number;
  title: string;
  description: string;
  votingType: 'simple' | 'multiple' | 'weighted';
  isSecret: boolean;
  allowAbstention: boolean;
  isActive: boolean;
  displayOrder: number;
  requiredPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface VotingsList {
  votings: Voting[];
  total: number;
}

export interface CreateVotingDTO {
  votingGroupId: number;
  title: string;
  description: string;
  votingType: 'simple' | 'multiple' | 'weighted';
  isSecret: boolean;
  allowAbstention: boolean;
  displayOrder: number;
  requiredPercentage: number;
}

