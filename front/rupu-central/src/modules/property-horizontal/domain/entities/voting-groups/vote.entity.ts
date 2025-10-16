/**
 * Entity: Vote (Voto)
 */

export interface Vote {
  id: number;
  votingId: number;
  votingOptionId: number;
  residentId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
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
 * - resident_id (number): ID del residente que vota
 * - voting_option_id (number): ID de la opción seleccionada
 * 
 * Campos opcionales:
 * - ip_address (string): IP desde donde se emite el voto
 * - user_agent (string): Información del navegador/dispositivo
 * - notes (string): Notas adicionales
 * 
 * VALIDACIONES IMPORTANTES:
 * - Un residente solo puede votar una vez por votación
 * - Las opciones deben pertenecer a la votación especificada
 * - No se pueden registrar votos fuera del periodo establecido
 */
export interface CreateVoteDTO {
  votingId: number;
  votingOptionId: number;
  residentId: number;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

