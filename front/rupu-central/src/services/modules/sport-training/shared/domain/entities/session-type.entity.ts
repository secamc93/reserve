/**
 * Entidad: Session Type (Tipo de Sesión)
 * Catálogo maestro de tipos de sesión de entrenamiento
 */
export interface SessionType {
  id: number;
  code: string;
  name: string;
  description: string;
  isGroup: boolean;
  maxParticipants: number | null;
  defaultDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
