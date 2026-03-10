/**
 * Entidad: Coach (Entrenador)
 * Entrenadores de la academia con sus especialidades
 */
export interface Coach {
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  specialties: CoachSpecialtyAssignment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Asignación de especialidad a entrenador
 */
export interface CoachSpecialtyAssignment {
  id: number;
  coachId: number;
  specialtyId: number;
  specialtyName: string;
  specialtyCode: string;
  yearsExperience: number;
  createdAt: string;
}

/**
 * DTO para crear entrenador
 */
export interface CreateCoachDTO {
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
}

/**
 * DTO para actualizar entrenador
 */
export interface UpdateCoachDTO {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

/**
 * DTO para asignar especialidad a entrenador
 */
export interface AssignCoachSpecialtyDTO {
  coachId: number;
  specialtyId: number;
  yearsExperience: number;
}
