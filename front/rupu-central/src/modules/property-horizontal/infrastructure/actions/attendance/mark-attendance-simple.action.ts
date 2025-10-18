'use server';

import { AttendanceRecordRepository } from '../../repositories/attendance/attendance-record.repository';
import { AttendanceRecord } from '../../../domain/entities/attendance/attendance-record.entity';

export interface MarkAttendanceSimpleInput { 
  token: string; 
  recordId: number; 
}

export interface MarkAttendanceSimpleResult { 
  success: boolean; 
  data?: AttendanceRecord; 
  error?: string; 
}

export async function markAttendanceSimpleAction(input: MarkAttendanceSimpleInput): Promise<MarkAttendanceSimpleResult> {
  try {
    const repo = new AttendanceRecordRepository();
    const data = await repo.markAttendanceSimple({ token: input.token, recordId: input.recordId });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
