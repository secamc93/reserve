/**
 * Repository Interface: AttendanceList
 */

import { AttendanceList, CreateAttendanceListDTO, UpdateAttendanceListDTO, AttendanceListSummary, AttendanceRecord } from '../../entities/attendance';

export interface AttendanceListMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

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
  page?: number;
  pageSize?: number;
  unitNumber?: string;
  attended?: boolean;
}

export interface IAttendanceListRepository {
  createAttendanceList(params: CreateAttendanceListParams): Promise<AttendanceList>;
  generateAttendanceList(params: GenerateAttendanceListParams): Promise<AttendanceList>;
  getAttendanceListById(params: GetAttendanceListParams): Promise<AttendanceList>;
  updateAttendanceList(params: UpdateAttendanceListParams): Promise<AttendanceList>;
  deleteAttendanceList(params: DeleteAttendanceListParams): Promise<void>;
  listAttendanceLists(params: ListAttendanceListsParams): Promise<AttendanceList[]>;
  getAttendanceListSummary(params: GetAttendanceListSummaryParams): Promise<AttendanceListSummary>;
  getAttendanceListRecords(params: GetAttendanceListRecordsParams): Promise<{ data: AttendanceRecord[]; meta: AttendanceListMeta }>;
}
