'use server';

import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface RemoveAttendanceListInput {
  token: string;
  id: number;
}

export interface RemoveAttendanceListResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function removeAttendanceListAction(
  input: RemoveAttendanceListInput
): Promise<RemoveAttendanceListResult> {
  const startTime = Date.now();
  const url = `${process.env.API_BASE_URL}/attendance/lists/${input.id}`;

  logHttpRequest({
    method: 'DELETE',
    url,
    token: input.token.substring(0, 20) + '...',
  });

  try {
    const repository = new AttendanceListRepository();
    await repository.deleteAttendanceList({ token: input.token, id: input.id });

    logHttpSuccess({
      status: 200,
      statusText: 'OK',
      duration: Date.now() - startTime,
      summary: `Lista de asistencia ${input.id} eliminada`,
    });

    return { success: true, message: 'Lista de asistencia eliminada' };
  } catch (error) {
    const duration = Date.now() - startTime;
    logHttpError({
      status: 500,
      statusText: 'Internal Server Error',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}



