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
  color?: string; // Color hexadecimal opcional (ej: "#22c55e")
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
  color?: string; // Color hexadecimal opcional (ej: "#22c55e")
}

