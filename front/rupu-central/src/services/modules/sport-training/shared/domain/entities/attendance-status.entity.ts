/**
 * Entidad: Attendance Status (Estado de Asistencia)
 * Catálogo maestro de estados de asistencia
 */
export interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
