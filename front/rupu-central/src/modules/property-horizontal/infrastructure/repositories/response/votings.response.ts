/**
 * Backend Response Types: Votings
 */

// ============================================
// VOTINGS (Votaciones)
// ============================================

export interface BackendVoting {
  id: number;
  voting_group_id: number;
  title: string;
  description: string;
  voting_type: 'simple' | 'multiple' | 'weighted' | 'majority';
  is_secret: boolean;
  allow_abstention: boolean;
  is_active: boolean;
  display_order: number;
  required_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface BackendGetVotingsResponse {
  success: boolean;
  message: string;
  data: BackendVoting[];
}

export interface BackendGetVotingByIdResponse {
  success: boolean;
  message: string;
  data: BackendVoting;
}

export interface BackendCreateVotingResponse {
  success: boolean;
  message: string;
  data: BackendVoting;
}

export interface BackendUpdateVotingResponse {
  success: boolean;
  message: string;
  data: BackendVoting;
  error?: string;
}

export interface BackendDeleteVotingResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface BackendActivateVotingResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface BackendDeactivateVotingResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================
// VOTING OPTIONS (Opciones de Votación)
// ============================================

export interface BackendVotingOption {
  id: number;
  voting_id: number;
  option_text: string;
  option_code: string;
  display_order: number;
  is_active: boolean;
  color?: string; // Color hexadecimal opcional
}

export interface BackendGetVotingOptionsResponse {
  success: boolean;
  message: string;
  data: BackendVotingOption[];
}

export interface BackendCreateVotingOptionResponse {
  success: boolean;
  message: string;
  data: BackendVotingOption;
}

// ============================================
// VOTES (Votos)
// ============================================

export interface BackendVote {
  id: number;
  voting_id: number;
  voting_option_id: number;
  property_unit_id: number;
  voted_at: string;
  ip_address: string;
  user_agent: string;
  notes?: string;
}

export interface BackendGetVotesResponse {
  success: boolean;
  message: string;
  data: BackendVote[];
}

export interface BackendCreateVoteResponse {
  success: boolean;
  message: string;
  data: BackendVote;
  error?: string; // Mensaje de error cuando success es false
}

