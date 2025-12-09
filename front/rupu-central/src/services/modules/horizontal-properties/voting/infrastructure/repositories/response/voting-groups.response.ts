/**
 * Interfaces de respuesta del backend para Grupos de Votación
 */

export interface BackendVotingGroup {
  id: number;
  business_id: number;
  name: string;
  description: string;
  voting_start_date: string;
  voting_end_date: string;
  is_active: boolean;
  requires_quorum: boolean;
  quorum_percentage: number;
  created_by_user_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendGetVotingGroupsResponse {
  success: boolean;
  message: string;
  data: BackendVotingGroup[];
}

export interface BackendCreateVotingGroupResponse {
  success: boolean;
  message: string;
  data: BackendVotingGroup;
  error?: string;
}

export interface BackendUpdateVotingGroupResponse {
  success: boolean;
  message: string;
  data: BackendVotingGroup;
  error?: string;
}

export interface BackendDeleteVotingGroupResponse {
  success: boolean;
  message: string;
  error?: string;
}

