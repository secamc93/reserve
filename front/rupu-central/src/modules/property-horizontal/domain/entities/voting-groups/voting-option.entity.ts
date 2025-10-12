/**
 * Entity: Voting Option (Opción de Votación)
 */

export interface VotingOption {
  id: number;
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  isActive: boolean;
}

export interface VotingOptionsList {
  options: VotingOption[];
  total: number;
}

export interface CreateVotingOptionDTO {
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
}

