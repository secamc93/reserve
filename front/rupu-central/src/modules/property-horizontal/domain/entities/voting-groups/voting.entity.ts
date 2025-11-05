/**
 * Entity: Voting (Votación)
 */

/**
 * Tipos de votación según API:
 * - "simple": Mayoría simple (más del 50%)
 * - "majority": Mayoría calificada (2/3 o porcentaje específico)
 * - "unanimity": Unanimidad (100% de aprobación)
 */
export type VotingType = 'simple' | 'majority' | 'unanimity' | 'multiple' | 'weighted';

export interface Voting {
  id: number;
  votingGroupId: number;
  title: string;
  description: string;
  votingType: VotingType;
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

/**
 * DTO para crear votación
 * Campos requeridos según API:
 * - title (string, min: 3, max: 200)
 * - description (string, max: 2000)
 * - voting_type ('simple' | 'majority' | 'unanimity')
 * - display_order (number, min: 1)
 * 
 * Campos opcionales:
 * - is_secret (boolean, default: false)
 * - allow_abstention (boolean, default: false)
 * - required_percentage (number)
 */
export interface CreateVotingDTO {
  votingGroupId: number;
  title: string;
  description: string;
  votingType: VotingType;
  isSecret?: boolean;
  allowAbstention?: boolean;
  displayOrder: number;
  requiredPercentage?: number;
}

/**
 * DTO para actualizar votación
 * Todos los campos son opcionales según API
 */
export interface UpdateVotingDTO {
  title?: string;
  description?: string;
  votingType?: VotingType;
  isSecret?: boolean;
  allowAbstention?: boolean;
  displayOrder?: number;
  requiredPercentage?: number;
}

