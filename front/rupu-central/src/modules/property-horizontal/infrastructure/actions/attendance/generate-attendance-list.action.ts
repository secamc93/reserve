/**
 * Server Action: Generate Attendance List
 */

'use server';

import { GenerateAttendanceListUseCase } from '../../../application/attendance';
import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceList } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface GenerateAttendanceListInput {
  token: string;
  votingGroupId: number;
}

export interface GenerateAttendanceListResult {
  success: boolean;
  data?: AttendanceList;
  error?: string;
}

export async function generateAttendanceListAction(
  input: GenerateAttendanceListInput
): Promise<GenerateAttendanceListResult> {
  const startTime = Date.now();
  const url = `${process.env.API_BASE_URL}/attendance/lists/generate`;

  logHttpRequest({
    method: 'POST',
    url,
    token: input.token.substring(0, 20) + '...',
    body: null, // No body needed, only query parameter
  });

  try {
    const repository = new AttendanceListRepository();
    const useCase = new GenerateAttendanceListUseCase(repository);

    const result = await useCase.execute(input);

    logHttpSuccess({
      status: 201,
      statusText: 'Created',
      duration: Date.now() - startTime,
      summary: `Lista de asistencia generada automáticamente para grupo ${input.votingGroupId}`,
      data: result.attendanceList,
    });

    return {
      success: true,
      data: result.attendanceList,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logHttpError({
      status: 400,
      statusText: 'Bad Request',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    console.error('❌ Error en generateAttendanceListAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
