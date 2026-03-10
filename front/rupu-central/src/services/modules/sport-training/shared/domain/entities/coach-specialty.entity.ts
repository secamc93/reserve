/**
 * Entidad: Coach Specialty (Especialidad de Entrenador)
 * Catálogo maestro de especialidades de entrenadores
 */
export interface CoachSpecialty {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
