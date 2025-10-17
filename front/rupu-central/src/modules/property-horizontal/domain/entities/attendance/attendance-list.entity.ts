/**
 * Entity: AttendanceList (Lista de Asistencia)
 */

export interface AttendanceList {
  id: number;
  votingGroupId: number;
  title: string;
  description: string;
  isActive: boolean;
  createdByUserId: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceListDTO {
  votingGroupId: number;
  title: string;
  description?: string;
  createdByUserId?: number;
  notes?: string;
}

export interface UpdateAttendanceListDTO {
  title?: string;
  description?: string;
  isActive?: boolean;
  notes?: string;
}

export interface AttendanceListSummary {
  totalUnits: number;
  attendedUnits: number;
  absentUnits: number;
  attendedAsOwner: number;
  attendedAsProxy: number;
  attendanceRate: number;
}
