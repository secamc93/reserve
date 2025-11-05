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

/**
 * DTO para crear grupo de votación
 * Campos requeridos según API:
 * - name (string, min: 3, max: 150)
 * - voting_start_date (datetime ISO 8601)
 * - voting_end_date (datetime ISO 8601)
 * 
 * Campos opcionales:
 * - description, requires_quorum, quorum_percentage, created_by_user_id, notes
 */
export interface CreateVotingGroupDTO {
  name: string;
  description?: string;
  votingStartDate: string; // ISO 8601 format
  votingEndDate: string;   // ISO 8601 format
  requiresQuorum?: boolean;
  quorumPercentage?: number;
  createdByUserId?: number;
  notes?: string;
}

/**
 * DTO para actualizar grupo de votación
 * Todos los campos son opcionales según API
 */
export interface UpdateVotingGroupDTO {
  name?: string;
  description?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  requiresQuorum?: boolean;
  quorumPercentage?: number;
  createdByUserId?: number;
  notes?: string;
}

