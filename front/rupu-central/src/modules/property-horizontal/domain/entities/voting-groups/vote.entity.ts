/**
 * Entity: Vote (Voto)
 */

export interface Vote {
  id: number;
  votingId: number;
  votingOptionId: number;
  propertyUnitId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  // Campos adicionales del SSE para facilitar el renderizado
  optionText?: string;
  optionCode?: string;
  optionColor?: string;
}

export interface VotesList {
  votes: Vote[];
  total: number;
}

/**
 * DTO para registrar un voto
 * Campos requeridos según API:
 * - property_unit_id (number): ID de la unidad que vota
 * - voting_option_id (number): ID de la opción seleccionada
 * 
 * Campos opcionales:
 * - ip_address (string): IP desde donde se emite el voto
 * - user_agent (string): Información del navegador/dispositivo
 * 
 * VALIDACIONES IMPORTANTES:
 * - Una unidad solo puede votar una vez por votación
 * - Las opciones deben pertenecer a la votación especificada
 * - No se pueden registrar votos fuera del periodo establecido
 */
export interface CreateVoteDTO {
  votingId: number;
  votingOptionId: number;
  propertyUnitId: number;
  ipAddress?: string;
  userAgent?: string;
}

