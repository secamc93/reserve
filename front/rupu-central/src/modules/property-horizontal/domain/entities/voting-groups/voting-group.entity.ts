/**
 * Entidad de dominio: Grupo de Votación
 */

export interface VotingGroup {
  id: number;
  businessId: number;
  name: string;
  description: string;
  votingStartDate: string;
  votingEndDate: string;
  isActive: boolean;
  requiresQuorum: boolean;
  quorumPercentage: number;
  createdByUserId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VotingGroupsList {
  votingGroups: VotingGroup[];
}

export interface CreateVotingGroupDTO {
  businessId: number;
  name: string;
  description: string;
  votingStartDate: string;
  votingEndDate: string;
  requiresQuorum: boolean;
  quorumPercentage: number;
  createdByUserId: number;
  notes?: string;
}

