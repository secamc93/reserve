'use server';

import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceList } from '../../../domain/entities/attendance';

export interface GetAttendanceListInput { token: string; id: number }
export interface GetAttendanceListResult { success: boolean; data?: AttendanceList; error?: string }

export async function getAttendanceListAction(input: GetAttendanceListInput): Promise<GetAttendanceListResult> {
  try {
    const repo = new AttendanceListRepository();
    const data = await repo.getAttendanceListById({ token: input.token, id: input.id });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



