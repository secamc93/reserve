'use server';

import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceRecord } from '../../../domain/entities/attendance';

export interface GetAttendanceListRecordsInput { token: string; id: number }
export interface GetAttendanceListRecordsResult { success: boolean; data?: AttendanceRecord[]; error?: string }

export async function getAttendanceListRecordsAction(input: GetAttendanceListRecordsInput): Promise<GetAttendanceListRecordsResult> {
  try {
    const repo = new AttendanceListRepository();
    const data = await repo.getAttendanceListRecords({ token: input.token, id: input.id } as any);
    return { success: true, data: data as unknown as AttendanceRecord[] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}


