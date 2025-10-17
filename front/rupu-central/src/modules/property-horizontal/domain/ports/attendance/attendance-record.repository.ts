/**
 * Repository Interface: AttendanceRecord
 */

import { AttendanceRecord, CreateAttendanceRecordDTO, MarkAttendanceDTO, UpdateAttendanceRecordDTO, VerifyAttendanceDTO } from '../../entities/attendance';

export interface CreateAttendanceRecordParams {
  token: string;
  data: CreateAttendanceRecordDTO;
}

export interface MarkAttendanceParams {
  token: string;
  data: MarkAttendanceDTO;
}

export interface GetAttendanceRecordParams {
  token: string;
  id: number;
}

export interface UpdateAttendanceRecordParams {
  token: string;
  id: number;
  data: UpdateAttendanceRecordDTO;
}

export interface DeleteAttendanceRecordParams {
  token: string;
  id: number;
}

export interface ListAttendanceRecordsParams {
  token: string;
  attendanceListId?: number;
  propertyUnitId?: number;
}

export interface VerifyAttendanceParams {
  token: string;
  id: number;
  data: VerifyAttendanceDTO;
}

export interface IAttendanceRecordRepository {
  createAttendanceRecord(params: CreateAttendanceRecordParams): Promise<AttendanceRecord>;
  markAttendance(params: MarkAttendanceParams): Promise<AttendanceRecord>;
  getAttendanceRecordById(params: GetAttendanceRecordParams): Promise<AttendanceRecord>;
  updateAttendanceRecord(params: UpdateAttendanceRecordParams): Promise<AttendanceRecord>;
  deleteAttendanceRecord(params: DeleteAttendanceRecordParams): Promise<void>;
  listAttendanceRecords(params: ListAttendanceRecordsParams): Promise<AttendanceRecord[]>;
  verifyAttendance(params: VerifyAttendanceParams): Promise<AttendanceRecord>;
}
