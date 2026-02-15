/**
 * Entidad: Player (Jugador)
 * Jugadores registrados en la academia (menores y adultos)
 */
export interface Player {
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  skillLevelId: number;
  skillLevelName: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear jugador
 */
export interface CreatePlayerDTO {
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  skillLevelId: number;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

/**
 * DTO para actualizar jugador
 */
export interface UpdatePlayerDTO {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  birthDate?: string;
  skillLevelId?: number;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  isActive?: boolean;
}
