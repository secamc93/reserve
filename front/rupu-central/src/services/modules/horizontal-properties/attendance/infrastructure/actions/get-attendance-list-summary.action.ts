'use server';

import { AttendanceListRepository } from '../repositories';
import { AttendanceListSummary } from '../../domain/entities';

export interface GetAttendanceListSummaryInput { token: string; id: number }
export interface GetAttendanceListSummaryResult { success: boolean; data?: AttendanceListSummary; error?: string }

export async function getAttendanceListSummaryAction(input: GetAttendanceListSummaryInput): Promise<GetAttendanceListSummaryResult> {
  try {
    const repo = new AttendanceListRepository();
    const data = await repo.getAttendanceListSummary({ token: input.token, id: input.id });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



