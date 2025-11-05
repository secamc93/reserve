'use server';

import { AttendanceRecordRepository } from '../../repositories/attendance/attendance-record.repository';
import { AttendanceRecord } from '../../../domain/entities/attendance/attendance-record.entity';

export interface UnmarkAttendanceSimpleInput { 
  token: string; 
  recordId: number; 
}

export interface UnmarkAttendanceSimpleResult { 
  success: boolean; 
  data?: AttendanceRecord; 
  error?: string; 
}

export async function unmarkAttendanceSimpleAction(input: UnmarkAttendanceSimpleInput): Promise<UnmarkAttendanceSimpleResult> {
  try {
    const repo = new AttendanceRecordRepository();
    const data = await repo.unmarkAttendanceSimple({ token: input.token, recordId: input.recordId });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
