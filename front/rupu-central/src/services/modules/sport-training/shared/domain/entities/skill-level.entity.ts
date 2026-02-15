/**
 * Entidad: Skill Level (Nivel de Habilidad)
 * Catálogo maestro de niveles de habilidad para jugadores
 */
export interface SkillLevel {
  id: number;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
