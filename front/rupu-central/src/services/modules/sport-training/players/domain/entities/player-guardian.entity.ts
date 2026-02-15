/**
 * Entidad: Player Guardian (Relación Jugador-Apoderado)
 * Relación entre jugadores menores y sus apoderados
 */
export interface PlayerGuardian {
  id: number;
  playerId: number;
  guardianId: number;
  guardianName?: string;
  guardianPhone?: string;
  isPrimary: boolean;
  createdAt: string;
}

/**
 * DTO para asignar apoderado a jugador
 */
export interface AssignGuardianDTO {
  playerId: number;
  guardianId: number;
  isPrimary: boolean;
}
