'use server';

import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceList } from '../../../domain/entities/attendance';

export interface ListAttendanceListsInput {
  token: string;
  businessId: number;
  title?: string;
  isActive?: boolean;
}

export interface ListAttendanceListsResult {
  success: boolean;
  data?: AttendanceList[];
  error?: string;
}

export async function listAttendanceListsAction(input: ListAttendanceListsInput): Promise<ListAttendanceListsResult> {
  try {
    const repo = new AttendanceListRepository();
    const data = await repo.listAttendanceLists({
      token: input.token,
      businessId: input.businessId,
      title: input.title,
      isActive: input.isActive,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



