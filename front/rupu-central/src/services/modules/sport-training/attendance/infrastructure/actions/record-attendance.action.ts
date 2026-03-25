'use server';
import { revalidatePath } from 'next/cache';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { RecordAttendanceDTO } from '../../domain';

export interface RecordAttendanceInput { token: string; data: RecordAttendanceDTO; }
export interface RecordAttendanceResult { success: boolean; message?: string; }

export async function recordAttendanceAction(input: RecordAttendanceInput): Promise<RecordAttendanceResult> {
  try {
    const repo = new AttendanceRepository();
    await repo.recordAttendance({ token: input.token, data: input.data });
    revalidatePath(`/sport-training/sessions/${input.data.sessionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
