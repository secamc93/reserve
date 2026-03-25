export interface AttendanceRecord {
  id: number;
  trainingSessionId: number;
  sessionDate?: string;
  sessionLocation?: string;
  playerId: number;
  playerName: string;
  attendanceStatusId: number;
  statusName: string;
  statusCode: string;
  statusColor: string;
  checkInTime?: string;
  checkOutTime?: string;
  recordedByCoachId?: number;
  recordedByCoachName?: string;
  recordedAt: string;
  performanceRating?: number;
  coachFeedback?: string;
  playerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordAttendanceDTO {
  sessionId: number;
  playerId: number;
  attendanceStatusId: number;
  checkInTime?: string;
  performanceRating?: number;
  coachFeedback?: string;
  playerNotes?: string;
}
