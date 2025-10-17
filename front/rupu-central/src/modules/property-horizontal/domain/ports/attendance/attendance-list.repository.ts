/**
 * Repository Interface: AttendanceList
 */

import { AttendanceList, CreateAttendanceListDTO, UpdateAttendanceListDTO, AttendanceListSummary } from '../../entities/attendance';

export interface CreateAttendanceListParams {
  token: string;
  data: CreateAttendanceListDTO;
}

export interface GenerateAttendanceListParams {
  token: string;
  votingGroupId: number;
}

export interface GetAttendanceListParams {
  token: string;
  id: number;
}

export interface UpdateAttendanceListParams {
  token: string;
  id: number;
  data: UpdateAttendanceListDTO;
}

export interface DeleteAttendanceListParams {
  token: string;
  id: number;
}

export interface ListAttendanceListsParams {
  token: string;
  businessId: number;
  title?: string;
  isActive?: boolean;
}

export interface GetAttendanceListSummaryParams {
  token: string;
  id: number;
}

export interface GetAttendanceListRecordsParams {
  token: string;
  id: number;
}

export interface IAttendanceListRepository {
  createAttendanceList(params: CreateAttendanceListParams): Promise<AttendanceList>;
  generateAttendanceList(params: GenerateAttendanceListParams): Promise<AttendanceList>;
  getAttendanceListById(params: GetAttendanceListParams): Promise<AttendanceList>;
  updateAttendanceList(params: UpdateAttendanceListParams): Promise<AttendanceList>;
  deleteAttendanceList(params: DeleteAttendanceListParams): Promise<void>;
  listAttendanceLists(params: ListAttendanceListsParams): Promise<AttendanceList[]>;
  getAttendanceListSummary(params: GetAttendanceListSummaryParams): Promise<AttendanceListSummary>;
  getAttendanceListRecords(params: GetAttendanceListRecordsParams): Promise<AttendanceList[]>; // Se definirá cuando implementemos AttendanceRecord
}
