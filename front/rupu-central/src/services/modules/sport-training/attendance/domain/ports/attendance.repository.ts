import { AttendanceRecord, RecordAttendanceDTO } from '../entities';

export interface RecordAttendanceParams { token: string; data: RecordAttendanceDTO; }
export interface GetBySessionParams { sessionId: number; businessId: number; token: string; page?: number; pageSize?: number; }
export interface GetByPlayerParams { playerId: number; businessId: number; token: string; page?: number; pageSize?: number; }

export interface AttendancePaginated {
  data: AttendanceRecord[]; total: number; page: number; pageSize: number; totalPages: number;
}

export interface IAttendanceRepository {
  recordAttendance(params: RecordAttendanceParams): Promise<AttendanceRecord>;
  getBySession(params: GetBySessionParams): Promise<AttendancePaginated>;
  getByPlayer(params: GetByPlayerParams): Promise<AttendancePaginated>;
}
