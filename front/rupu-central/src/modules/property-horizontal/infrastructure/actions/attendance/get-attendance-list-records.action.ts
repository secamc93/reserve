'use server';

import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceRecord } from '../../../domain/entities/attendance/attendance-record.entity';

export interface GetAttendanceListRecordsInput { token: string; id: number; page?: number; pageSize?: number; unitNumber?: string; attended?: boolean }
export interface GetAttendanceListRecordsResult { 
  success: boolean; 
  data?: AttendanceRecord[]; 
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  error?: string; 
}

export async function getAttendanceListRecordsAction(input: GetAttendanceListRecordsInput): Promise<GetAttendanceListRecordsResult> {
  try {
    const repo = new AttendanceListRepository();
    const { data, meta } = await repo.getAttendanceListRecords({ token: input.token, id: input.id, page: input.page, pageSize: input.pageSize, unitNumber: input.unitNumber, attended: input.attended });
    
    // Pasar los datos de paginación directamente en el response
    return { 
      success: true, 
      data: data as unknown as AttendanceRecord[], 
      total: meta?.total,
      page: meta?.page,
      page_size: meta?.page_size,
      total_pages: meta?.total_pages
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



